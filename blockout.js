var keyQ=81, keyW=87, keyE=69, keyA=65, keyS=83, keyD=68, keyP=80;
var keySPACE=32, keyLEFT=37, keyUP=38, keyRIGHT=39, keyDOWN=40;
var COLORS=["fuchsia", "gray", "silver", "maroon", "green", "navy", "olive", "orange", "purple", "red", "yellow", "lime", "blue"];
var PITWIDTH=300, PITHEIGHT=300;
var DEPTH=13, WIDTH=5, HEIGHT=5;
var TIMEINTERVAL=200;
var BLOCKSIZE = 17;

var sndDing, sndDong, sndDang, sndGame;
var btnCubes, btnScore, btnLevel;

var dropInterval;
var bPause=false, bGameOver=true;
var ctxPit, ctxSolid, ctxWired, activeContext;
var iblockset, iblockcubes, ilevel, icubes=0, iscore=0;
var iRotateCount=0, iRotateChar=0;

var xx, yy, zz, wireCount;
var newBlock = new Array(0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0, 0);
var tmpBlock = new Array(0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0, 0);
var CubeCount= new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0);
var Wires = new Array(256*7);
var Pit = new Array(14*7*7);

function _3D_Clear( ctx )
{
	activeContext = ctx;
	activeContext.clearRect(0, 0, 2*PITWIDTH, 2*PITHEIGHT);
}
function _3D_MoveTo(x, y, z)
{
	activeContext.moveTo( ((x*2-WIDTH)/(WIDTH+z)+1)*PITWIDTH, 
					 ((y*2-HEIGHT)/(HEIGHT+z)+1)*PITHEIGHT );
}
function _3D_LineTo(x, y, z)
{
	activeContext.lineTo( ((x*2-WIDTH)/(WIDTH+z)+1)*PITWIDTH, 
					 ((y*2-HEIGHT)/(HEIGHT+z)+1)*PITHEIGHT);
}
function solidFaceBegin() 
{
	ctxSolid.beginPath();
}
function solidFaceClose()
{
	ctxSolid.closePath();
	ctxSolid.fill();
	ctxSolid.stroke();
}
function drawWireBlock()
{
	_3D_Clear( ctxWired );
	ctxWired.beginPath();
	BL_blockWires();
	ctxWired.closePath();
	ctxWired.stroke();
}
function drawRotation()
{
	_3D_Clear( ctxWired );
	ctxWired.beginPath();
	BL_rotateWires(iRotateChar, ++iRotateCount);
	ctxWired.closePath();
	ctxWired.stroke();
	if ( iRotateCount <3 ) 
		setTimeout( drawRotation, 50 );
	else
		drawWireBlock();
}
function drawSolidBlocks()
{
	_3D_Clear( ctxSolid );
	for ( var i=DEPTH-1; i>=0; i-- ) {
		ctxSolid.fillStyle = COLORS[i];
		BL_droppedCubes(i);
	}
}
function init_Game()
{
	ctxPit = document.getElementById("pit").getContext("2d");
	ctxPit.strokeStyle="green";
	ctxSolid = document.getElementById("solidcubes").getContext("2d");
	ctxSolid.strokeStyle = "black";
	ctxWired = document.getElementById("wirecubes").getContext("2d");
	ctxWired.strokeStyle = "white";
	
	sndDing = document.getElementById("ding");
	sndDong = document.getElementById("dong");
	sndDang = document.getElementById("dang");
	sndGame = document.getElementById("game");
	btnCubes = document.getElementById("cubes");
	btnScore = document.getElementById("score");
	btnLevel = document.getElementById("level");
	window.addEventListener('keydown',keyDownEvent,true);

	_3D_Clear( ctxPit );	//draw pit begin
	ctxPit.fillStyle="black";
	ctxPit.fillRect(0, 0, 2*PITWIDTH, 2*PITHEIGHT);
	ctxPit.beginPath();
	for ( var z=1; z<DEPTH; z++){
		_3D_MoveTo(0, 0, z);
		_3D_LineTo(WIDTH, 0, z);
		_3D_LineTo(WIDTH, HEIGHT, z);
		_3D_LineTo(0, HEIGHT, z);
		_3D_LineTo(0, 0, z);
	}
	for ( var i=0; i<=WIDTH; i++){
		_3D_MoveTo(i, 0, 0);
		_3D_LineTo(i, 0, DEPTH);
		_3D_LineTo(i, HEIGHT, DEPTH);
		_3D_LineTo(i, HEIGHT, 0);
		_3D_MoveTo(0, i, 0);
		_3D_LineTo(0, i, DEPTH);
		_3D_LineTo(WIDTH, i, DEPTH);
		_3D_LineTo(WIDTH, i, 0);
	}
	ctxPit.closePath();
	ctxPit.stroke();      	//draw pit end
}
function start_Game() {
	if ( bGameOver==false ) return ;
	bGameOver=false;
	bPause=false;
	iblockset = document.getElementById("blockset").value;
	ilevel = document.getElementById("level").value;
	BL_initGame();
	iblockcubes = BL_newBlock();
	drawSolidBlocks();
	drawWireBlock();
	dropInterval = setInterval( onDropTick, TIMEINTERVAL*(10-ilevel));  
}
function keyHandler( vKey )
{
	if ( bGameOver ) return;
	if ( bPause && vKey!=keyP ) return;
	switch( vKey ) {
	case keyP:
		bPause=!bPause;
		if ( !bPause ) 
			dropInterval = setInterval(onDropTick, TIMEINTERVAL*(10-ilevel) );
		else 
			clearInterval( dropInterval );
		break;

	case keySPACE:
		while ( BL_moveBlock(keySPACE) );
		drawWireBlock();
		setTimeout( onDropTick, 200 );
		break;
 	
	case keyUP:
	case keyDOWN:
	case keyLEFT:
	case keyRIGHT:
		BL_moveBlock(vKey);
		drawWireBlock();
		break;
	
	case keyQ:
	case keyW:
	case keyE:
	case keyA:
	case keyS:
	case keyD:
		if ( BL_rotateBlock(vKey) ){
			iRotateCount = 0; 
			iRotateChar = vKey;
			setTimeout( drawRotation, 50 );
		}
		break;
	}
}
function keyDownEvent( e )
{
	keyHandler(e.keyCode);
}
function onDropTick() 
{
	if ( BL_moveBlock(keySPACE) == false ) {
		if ( BL_dropBlock() ) {
			icubes += iblockcubes;
			if ( Math.round(icubes/150) > ilevel ) {
				if ( ilevel<9 ) {
					ilevel++;
					clearInterval(dropInterval);
					dropInterval = setInterval(onDropTick, TIMEINTERVAL*(10-ilevel) );
					sndDang.play();
				}
			}

			BL_clearLayer()>0 ? sndDing.play() : sndDong.play();
			drawSolidBlocks();

			btnScore.value = iscore;
			btnCubes.value = icubes;
			btnLevel.value = ilevel;
			iblockcubes=BL_newBlock();
		}
		else {
			clearInterval(dropInterval);
			bGameOver = true;
			ilevel = 0;
			sndGame.play();
		}
	}
	drawWireBlock();
}
function BL_initGame()
{
	var i, j, k;
	
	for ( i=1; i<=HEIGHT; i++ )				// fill the floor of the pit
		for ( j=1; j<=WIDTH; j++ ) {
			Pit[DEPTH*49+i*7+j]=1;
			for ( k=0; k<DEPTH; k++ )
				Pit[k*49+i*7+j]=0;
		}
	for ( k=0; k<=DEPTH; k++ ) {			// build a wall around the pit
		CubeCount[k]=0;							
		for ( i=1; i<=HEIGHT; i++ ) {
			Pit[k*49+0*7+i]=1;
			Pit[k*49+(WIDTH+1)*7+i]=1;
		}
		for ( i=1; i<=WIDTH; i++ ) {
			Pit[k*49+i*7+0]=1;
			Pit[k*49+i*7+HEIGHT+1]=1;
		}
	}
	icubes = 0;
	iscore = 0;
}

function BL_newBlock()
{
	var i = Math.random()*10*iblockset;
	if ( i>20 ) i = Math.random()*10*iblockset;
	i = Math.round(i);
	
	for ( var j=0; j<BLOCKSIZE; j++ ) 
		newBlock[j]=BLOCKS[i*BLOCKSIZE+j];
	
	xx=(WIDTH+1)/2;
	yy=(HEIGHT+1)/2;
	zz=0;

	return newBlock[BLOCKSIZE-2];		
}

function BL_moveBlock( vKey ) 
{
	var tx=xx, ty=yy, tz=zz;
	
	switch (vKey) {
		case keyUP:   ty--; break;
		case keyDOWN: ty++; break;
		case keyLEFT: tx--; break;
		case keyRIGHT:tx++; break;
		case keySPACE:tz++; break;
	}

	for ( var i=0; i<newBlock[BLOCKSIZE-2]; i++ ) {
		if ( Pit[(tz+newBlock[i*3+2])*49+(ty+newBlock[i*3+1])*7+(tx+newBlock[i*3+0])]==1 ) 
			return false;
	}

	xx=tx; yy=ty; zz=tz;
	return true;
} 
function BL_rotateBlock( vKey )
{
	var tx=xx, ty=yy, tz=zz, i, j;
	
	for ( j=0; j<BLOCKSIZE; j++ ) 
		tmpBlock[j]=newBlock[j];

	switch (vKey) {
		case keyQ:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+1]=-newBlock[i*3+2];
				tmpBlock[i*3+2]=newBlock[i*3+1];
			}
			break;
		case keyW:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+0]=-newBlock[i*3+2];
				tmpBlock[i*3+2]=newBlock[i*3+0];
			}
			break;
		case keyE:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+0]=-newBlock[i*3+1];
				tmpBlock[i*3+1]=newBlock[i*3+0];
			}
			break;
		case keyA:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+1]=newBlock[i*3+2];
				tmpBlock[i*3+2]=-newBlock[i*3+1];
			}
			break;
		case keyS:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+0]=newBlock[i*3+2];
				tmpBlock[i*3+2]=-newBlock[i*3+0];
			}
			break;
		case keyD:
			for (i=0; i<newBlock[BLOCKSIZE-2]; i++) {
				tmpBlock[i*3+0]=newBlock[i*3+1];
				tmpBlock[i*3+1]=-newBlock[i*3+0];
			}
			break;
	}

	for ( i=0; i<tmpBlock[BLOCKSIZE-2]; i++ ) {
		if ( Pit[(tz+tmpBlock[i*3+2])*49+(ty+tmpBlock[i*3+1])*7+(tx+tmpBlock[i*3+0])]==1 ) 
			return false;
	}

	xx=tx; yy=ty; zz=tz;
	for ( j=0; j<BLOCKSIZE; j++ ) newBlock[j]=tmpBlock[j];

	return true;
}

function BL_dropBlock()
{
	for (var i=0; i<newBlock[BLOCKSIZE-2]; i++ ) {
		var tz = zz+newBlock[i*3+2];
		if ( tz==0 ) return false;
		Pit[tz*49+(yy+newBlock[i*3+1])*7+(xx+newBlock[i*3+0])]=1;
		CubeCount[tz]++;
	}

	iscore+=newBlock[BLOCKSIZE-1]*(ilevel+1);
	
	return true;
}

function BL_clearLayer()
{
	var iFilled=0, isl=0.5, i, j, k, kz;
	for (k=1; k<DEPTH; k++ ) {
		if ( CubeCount[k]==WIDTH*HEIGHT ) {
			iFilled++; isl = isl*2;
			for ( kz=k; kz>0; kz-- ){
				CubeCount[kz]=CubeCount[kz-1];
				for ( j=1; j<=HEIGHT; j++ )
					for ( i=1; i<=WIDTH; i++ )
						Pit[kz*49+j*7+i] = Pit[(kz-1)*49+j*7+i];
			}
		}
	}
	if ( iFilled>0 ) iscore = iscore + isl*125;
	return iFilled;
}
function BL_droppedCubes(k)
{
	var x0, y0, z0=k, x1, y1, z1=k+1;

	for ( y0=0,y1=1; y0<HEIGHT; y0++,y1++ )
		for ( x0=0,x1=1; x0<WIDTH; x0++,x1++ )
			if ( Pit[k*49+y1*7+x1]==1 ){
				solidFaceBegin();				//bottom
				_3D_MoveTo(x0, y0, z1);	
				_3D_LineTo(x1, y0, z1);	
				_3D_LineTo(x1, y1, z1);	
				_3D_LineTo(x0, y1, z1);
				_3D_LineTo(x0, y0, z1);
				solidFaceClose();
			}
	for ( y0=0,y1=1; y0<HEIGHT; y0++,y1++ )
		for ( x0=0,x1=1; x0<WIDTH; x0++,x1++ )
			if ( Pit[k*49+y1*7+x1]==1 ){
				if ( Pit[k*49+y1*7+x0]==0 ) {							
					solidFaceBegin();				//left side
					_3D_MoveTo(x0, y0, z0); 
					_3D_LineTo(x0, y0, z1);
					_3D_LineTo(x0, y1, z1); 
					_3D_LineTo(x0, y1, z0);
					_3D_LineTo(x0, y0, z0);
					solidFaceClose();
				}

				if ( Pit[k*49+y1*7+x1+1]==0 ) {							
					solidFaceBegin();				//right side
					_3D_MoveTo(x1, y1, z0); 
					_3D_LineTo(x1, y1, z1);
					_3D_LineTo(x1, y0, z1); 
					_3D_LineTo(x1, y0, z0);
					_3D_LineTo(x1, y1, z0);
					solidFaceClose();
				}

				if ( Pit[k*49+(y1+1)*7+x1]==0 ) {							
					solidFaceBegin();				//up side
					_3D_MoveTo(x0, y1, z0); 
					_3D_LineTo(x0, y1, z1);
					_3D_LineTo(x1, y1, z1); 
					_3D_LineTo(x1, y1, z0);
					_3D_LineTo(x0, y1, z0);
					solidFaceClose();
				}

				if ( Pit[k*49+y0*7+x1]==0 ) {							
					solidFaceBegin();				//down side
					_3D_MoveTo(x1, y0, z0); 
					_3D_LineTo(x1, y0, z1);
					_3D_LineTo(x0, y0, z1); 
					_3D_LineTo(x0, y0, z0);
					_3D_LineTo(x1, y0, z0);
					solidFaceClose();
				}
			}

	for ( y0=0,y1=1; y0<HEIGHT; y0++,y1++ )
		for ( x0=0,x1=1; x0<WIDTH; x0++,x1++ )
			if ( Pit[k*49+y1*7+x1]==1 ){
				solidFaceBegin();					//top
				_3D_MoveTo(x0, y0, z0);	
				_3D_LineTo(x1, y0, z0);	
				_3D_LineTo(x1, y1, z0);	
				_3D_LineTo(x0, y1, z0);
				_3D_LineTo(x0, y0, z0);
				solidFaceClose();
			}
}

function addWire(sx, sy, sz, dx, dy, dz)
{
	var bFound=false;
	
	for ( var i=0; i<wireCount; i++ ) {
		if ( sx==Wires[i*7+0] && sy==Wires[i*7+1] && sz==Wires[i*7+2] &&
			 dx==Wires[i*7+3] && dy==Wires[i*7+4] && dz==Wires[i*7+5] ) {
			Wires[i*7+6]++;
			bFound = true;
		}
		if ( sx==Wires[i*7+3] && sy==Wires[i*7+4] && sz==Wires[i*7+5] &&
			 dx==Wires[i*7+0] && dy==Wires[i*7+1] && dz==Wires[i*7+2] ) {
			Wires[i*7+6]++;
			bFound = true;
		}
	}
	if ( bFound == false ) {
		Wires[wireCount*7+0]=sx;
		Wires[wireCount*7+1]=sy;
		Wires[wireCount*7+2]=sz;
		Wires[wireCount*7+3]=dx;
		Wires[wireCount*7+4]=dy;
		Wires[wireCount*7+5]=dz;
		Wires[wireCount*7+6]=1;
		wireCount++;
	}
}
function BL_blockWires()
{
	wireCount=0;
	Wires[wireCount*7+0]=0;
	Wires[wireCount*7+1]=0;
	Wires[wireCount*7+2]=0;
	Wires[wireCount*7+3]=0;
	Wires[wireCount*7+4]=0;
	Wires[wireCount*7+5]=0;
	for ( var i=0; i<newBlock[BLOCKSIZE-2]; i++ ){
		var ux=newBlock[i*3], lx=ux-1;
		var uy=newBlock[i*3+1], ly=uy-1;
		var uz=newBlock[i*3+2], lz=uz+1;

		addWire(lx, ly, lz, ux, ly, lz);
		addWire(ux, ly, lz, ux, uy, lz);
		addWire(ux, uy, lz, lx, uy, lz);
		addWire(lx, uy, lz, lx, ly, lz);
		addWire(lx, ly, uz, ux, ly, uz);
		addWire(ux, ly, uz, ux, uy, uz);
		addWire(ux, uy, uz, lx, uy, uz);
		addWire(lx, uy, uz, lx, ly, uz);
		addWire(lx, ly, lz, lx, ly, uz);
		addWire(ux, ly, lz, ux, ly, uz);
		addWire(ux, uy, lz, ux, uy, uz);
		addWire(lx, uy, lz, lx, uy, uz);
	}

	for ( var i=0; i<wireCount; i++ )
		if ( Wires[i*7+6]%2==1 ) {
			_3D_MoveTo(Wires[i*7+0]+xx, Wires[i*7+1]+yy, Wires[i*7+2]+zz);
			_3D_LineTo(Wires[i*7+3]+xx, Wires[i*7+4]+yy, Wires[i*7+5]+zz);
		}
}
var Sine = new Array(0.0, 0.383, 0.707, 0.924, 1.0);
var Cosine = new Array(1.0, 0.924, 0.707, 0.383, 0.0);
function BL_rotateWires(vKey, degree)
{
	var rsx, rsy, rsz, rdx, rdy, rdz;
	
	for ( var i=0; i<wireCount; i++ )
		if ( Wires[i*7+6]%2==1 ) {
			switch (vKey) {
				case keyQ:
					rsx = Wires[i*7+0]; rdx = Wires[i*7+3];
					rsy = Wires[i*7+1]*Cosine[degree]-Wires[i*7+2]*Sine[degree];
					rdy = Wires[i*7+4]*Cosine[degree]-Wires[i*7+5]*Sine[degree];
					rsz = Wires[i*7+2]*Cosine[degree]+Wires[i*7+1]*Sine[degree];
					rdz = Wires[i*7+5]*Cosine[degree]+Wires[i*7+4]*Sine[degree];
					break;
				case keyA:
					rsx = Wires[i*7+0]; rdx = Wires[i*7+3];
					rsy = Wires[i*7+1]*Cosine[degree]+Wires[i*7+2]*Sine[degree];
					rdy = Wires[i*7+4]*Cosine[degree]+Wires[i*7+5]*Sine[degree];
					rsz = Wires[i*7+2]*Cosine[degree]-Wires[i*7+1]*Sine[degree];
					rdz = Wires[i*7+5]*Cosine[degree]-Wires[i*7+4]*Sine[degree];
					break;
				case keyS:
					rsy = Wires[i*7+1]; rdy = Wires[i*7+4];
					rsx = Wires[i*7+0]*Cosine[degree]-Wires[i*7+2]*Sine[degree];
					rdx = Wires[i*7+3]*Cosine[degree]-Wires[i*7+5]*Sine[degree];
					rsz = Wires[i*7+2]*Cosine[degree]+Wires[i*7+0]*Sine[degree];
					rdz = Wires[i*7+5]*Cosine[degree]+Wires[i*7+3]*Sine[degree];
					break;
				case keyW:
					rsy = Wires[i*7+1]; rdy = Wires[i*7+4];
					rsx = Wires[i*7+0]*Cosine[degree]+Wires[i*7+2]*Sine[degree];
					rdx = Wires[i*7+3]*Cosine[degree]+Wires[i*7+5]*Sine[degree];
					rsz = Wires[i*7+2]*Cosine[degree]-Wires[i*7+0]*Sine[degree];
					rdz = Wires[i*7+5]*Cosine[degree]-Wires[i*7+3]*Sine[degree];
					break;
				case keyE:
					rsz = Wires[i*7+2]; rdz = Wires[i*7+5];
					rsx = Wires[i*7+0]*Cosine[degree]-Wires[i*7+1]*Sine[degree];
					rdx = Wires[i*7+3]*Cosine[degree]-Wires[i*7+4]*Sine[degree];
					rsy = Wires[i*7+1]*Cosine[degree]+Wires[i*7+0]*Sine[degree];
					rdy = Wires[i*7+4]*Cosine[degree]+Wires[i*7+3]*Sine[degree];
					break;
				case keyD:
					rsz = Wires[i*7+2]; rdz = Wires[i*7+5];
					rsx = Wires[i*7+0]*Cosine[degree]+Wires[i*7+1]*Sine[degree];
					rdx = Wires[i*7+3]*Cosine[degree]+Wires[i*7+4]*Sine[degree];
					rsy = Wires[i*7+1]*Cosine[degree]-Wires[i*7+0]*Sine[degree];
					rdy = Wires[i*7+4]*Cosine[degree]-Wires[i*7+3]*Sine[degree];
					break;
			}
			_3D_MoveTo(rsx+xx, rsy+yy, rsz+zz);
			_3D_LineTo(rdx+xx, rdy+yy, rdz+zz);
		}
}

var BLOCKS = new Array(
				0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 1, 1,
				0,0,0, 1,0,0, 0,0,0, 0,0,0, 0,0,0, 2, 2,
				0,0,0, 1,0,0, 0,1,0, 0,0,0, 0,0,0, 3, 3,
				0,0,0, 1,0,0, -1,0,0, 0,0,0, 0,0,0, 3, 3,
				0,0,0, 1,0,0, 0,1,0, 1,1,0, 0,0,0, 4, 4,
				0,0,0, -1,0,0, 0,-1,0, 1,0,0, 0,0,0, 4, 4,
				0,0,0, -1,0,0, 0,-1,0, 1,-1,0, 0,0,0, 4, 4,
				0,0,0, -1,0,0, -1,-1,0, 1,0,0, 0,0,0, 4, 4,
				0,0,0, -1,0,0, 1,0,0, 2,0,0, 0,0,0, 4, 4,
				0,0,0, -1,0,0, -1,-1,0, 1,0,0, 1,-1,0, 5, 5,
				0,0,0, -1,0,0, -1,1,0, 0,-1,0, 1,-1,0, 5, 5,
				0,0,0, -1,0,0, 0,-1,0, 1,0,0, 0,1,0, 5, 5,
				0,0,0, -1,0,0, -1,1,0, 1,0,0, 1,-1,0, 5, 5,
				0,0,0, -1,0,0, -1,1,0, 1,0,0, 0,-1,0, 5, 5,
				0,0,0, -1,0,0, -1,-1,0, -1,1,0, 1,0,0, 5, 5,
				0,0,0, 1,0,0, 2,0,0, 0,-1,0, 0,-2,0, 5, 5,
				0,0,0, 1,0,0, 1,1,0, 0,1,0, 0,-1,0, 5, 5,
				0,0,0, -1,0,0, -2,0,0, 1,0,0, 1,1,0, 5, 5,
				0,0,0, -1,1,0, 0,1,0, 1,0,0, 2,0,0, 5, 5,
				0,0,0, -1,0,0, 0,-1,0, 1,0,0, 2,0,0, 5, 5,
				0,0,0, -1,0,0, -2,0,0, 1,0,0, 2,0,0, 5, 5,
				0,0,0, 1,0,0, 0,-1,0, 0,0,1, 0,0,0, 4, 8,
				0,0,0, -1,0,0, 0,-1,0, -1,0,1, 0,0,0, 4, 8,
				0,0,0, 1,0,0, 0,1,0, 0,1,1, 0,0,0, 4, 8,
				0,0,0, 1,0,0, 0,-1,0, 0,1,0, 0,0,1, 5, 10,
				0,0,0, 1,0,0, 0,-1,0, 1,-1,0, 0,0,1, 5, 10,
				0,0,0, 0,1,0, 0,-1,0, 0,1,1, 1,-1,0, 5, 10,
				0,0,0, -1,0,0, -1,0,1, 1,0,0, 1,-1,0, 5, 10,
				0,0,0, 1,0,0, 0,-1,0, 0,1,0, 0,1,1, 5, 10,
				0,0,0, -1,0,0, -1,0,1, 1,0,0, 0,1,0, 5, 10,
				0,0,0, 1,0,0, 2,0,0, 0,1,0, 0,1,1, 5, 10,
				0,0,0, -1,0,0, -1,0,1, 0,-1,0, 0,-2,0, 5, 10,
				0,0,0, -1,0,1, 0,0,1, 0,1,0, 1,1,0, 5, 10,
				0,0,0, -1,0,1, 0,0,1, 0,-1,0, 1,-1,0, 5, 10,
				0,0,0, 0,1,0, 0,1,1, 1,0,0, 1,-1,0, 5, 10,
				0,0,0, -1,0,0, -1,0,1, 0,-1,0, 1,-1,0, 5, 10,
				0,0,0, -1,0,0, 0,-1,0, 1,-1,0, 0,0,1, 5, 10,
				0,0,0, -1,1,0, 0,1,0, 1,0,0, 0,0,1, 5, 10,
				0,0,0, 1,0,0, 1,0,-1, 0,1,0, 0,1,1, 5, 10,
				0,0,0, 1,0,0, -1,0,0, -1,-1,0, -1,0,1, 5, 10);
