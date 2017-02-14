"use strict";

var canvas;
var gl;
var program;

var pointsArray=[];
var normalsArray=[];


var near=0.1;
var far=100;
var FOV=75;
var aspect=1.5625;

var x=0;
var y=0;
var z=-30;

var index=0;

var materialShininess=100.0;

var lightPosition= vec4(-10,20,10,1.0);

var ambientProduct=mult(vec4(0.4,0.4,0.4,1.0),vec4(0.0,0.8,0.0,1.0));
var diffuseProduct=mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(0.0, 0.8, 0.0, 1.0));
var specularProduct=mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(0.9, 0.4, 0.1, 1.0));

var ambientProductLoc,diffuseProductLoc,specularProductLoc;



var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);


var modelViewMatrix,projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var transformationMatrix,transformationMatrixLoc;

window.onload=function init()
{
  canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );  // change the background color to black

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    projectionMatrix=perspective(FOV,aspect,near,far);

    tetrahedron(va,vb,vc,vd,4); 

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW ); 

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 
       "projectionMatrix"), false, flatten(projectionMatrix) );

    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );

     transformationMatrixLoc=gl.getUniformLocation(program,"transformationMatrix");

    render();


}



var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix=mat4();
    modelViewMatrix=mult(modelViewMatrix,translate(x,y,z));
   // modelViewMatrix=mult(modelViewMatrix,translate(0,5,0));


    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));

    var cnt=mat4();
    cnt=mult(scalem(vec3(3,3,3)),cnt);
    cnt=mult(translate(0,5,0),cnt);
    gl.uniformMatrix4fv(transformationMatrixLoc,false,flatten(cnt));

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProductLoc"),flatten(ambientProduct));

    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProductLoc"),flatten(diffuseProduct));
        
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProductLoc"),flatten(specularProduct));   

    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
        

    for(var i=0;i<index;i+=3)
      gl.drawArrays( gl.TRIANGLES, i, 3 );

    var cnt=mat4();
    cnt=mult(scalem(vec3(7,7,7)),cnt);
    cnt=mult(translate(0,1.5,0),cnt);
    gl.uniformMatrix4fv(transformationMatrixLoc,false,flatten(cnt));

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProductLoc"),flatten(ambientProduct));

    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProductLoc"),flatten(diffuseProduct));
        
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProductLoc"),flatten(specularProduct));   

    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );


      gl.drawArrays( gl.TRIANGLES, index, 36 );


    requestAnimFrame(render);
}



function triangle(a, b, c) {
     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);
      

    
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1);
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
} 


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );   // push the points for drawing the cube
    }
      
}








