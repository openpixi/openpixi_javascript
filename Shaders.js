//contains the shader code and returns new shader materials
//the shader code can also be included in index.html in the following way which might be easier to work with:
//
//<script id = "someFragmentShader" type="x-shader/x-fragment">
// void main(){
//      ...
// }
//</script>
//change the type to x-shader/x-vertex for vertex shaders
//
//the shader material then accesses the code like this:
//new THREE.ShaderMaterial({
//uniforms:{
//    ...
//},
//
//vertexShader: document.getElementById('someVertexShader').textContent,
//fragmentShader: document.getElementById('someFragmentShader').textContent};
Shaders = {


    //sets the vertices of the particle system (=each particle) to a new position according to value in position texture
    //lookup value is the vertex' initial position
    getParticleShader : function(){ return new THREE.ShaderMaterial({
        uniforms:{

            lookup: {type:"t", value:null}

        },

        vertexShader: [
            "uniform sampler2D lookup;",

            "void main() {",

            "vec2 lookupuv = position.xy ;",
            "vec3 pos = texture2D( lookup, lookupuv ).xyz;",
            "vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );",
            "gl_PointSize  = 1.5;",
            "gl_Position = projectionMatrix * mvPosition;",

            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform vec3 psColor;",
            "uniform float opacity;",
            "void main() {",
            "gl_FragColor = vec4( 1.0,1.0,1.0, opacity );",
            "}"

        ].join("\n")
    })},

    //as the name suggests, this shader lets vertices and fragments pass through unchanged
    getPassThruShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            resolution: { type: "v2", value: null },
            texture: { type: "t", value: null }
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform vec2 resolution;",
            "uniform sampler2D texture;",

            "void main()	{",

            "vec2 uv = gl_FragCoord.xy / resolution.xy;",

            "vec3 color = texture2D( texture, uv ).xyz;",

            "gl_FragColor=vec4(color, 1.0);",

            "}"

        ].join("\n")





    })},

    //calculates new position of each paticle
    //lookup value is the particle's initial position
    getPositionShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            dt: { type: "f", value: null },
            textureVelocity: {type: "t", value: null},
            texturePosition: {type: "t", value: null}
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [

            "uniform vec2 resolution;",
            "uniform float dt;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D texturePosition;",

            "const float UPPER_BOUNDS = 200.0;",
            "const float LOWER_BOUNDS = -UPPER_BOUNDS;",

            "void main()	{",


            "vec2 uv = gl_FragCoord.xy / resolution.xy;",

            "vec3 position = texture2D( texturePosition, uv ).xyz;",

            "vec3 velocity = texture2D( textureVelocity, uv ).xyz;",

            //periodic boundary box:
            "vec3 newPosition = position + velocity * dt;",

            "if (newPosition.x < LOWER_BOUNDS) position.x += UPPER_BOUNDS*2.0;",
            "if (newPosition.y < LOWER_BOUNDS) position.y += UPPER_BOUNDS*2.0;",
            "if (newPosition.z < LOWER_BOUNDS) position.z += UPPER_BOUNDS*2.0;",

            "if (newPosition.x > UPPER_BOUNDS) position.x -= UPPER_BOUNDS*2.0;",
            "if (newPosition.y > UPPER_BOUNDS) position.y -= UPPER_BOUNDS*2.0;",
            "if (newPosition.z > UPPER_BOUNDS) position.z -= UPPER_BOUNDS*2.0;",

            "gl_FragColor=vec4(position + velocity*dt , 1.0);",

            "}"

        ].join("\n")

    })},

    //calculates new velocity of each paticle
    getVelocityShader: function(){return new THREE.ShaderMaterial({

        uniforms:{
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            dt: { type: "f", value: null },
            textureVelocity: {type: "t", value: null},
            textureAcceleration: {type: "t", value: null}
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform vec2 resolution;",
            "uniform float dt;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D textureAcceleration;",


            "void main()	{",

            "vec2 uv = gl_FragCoord.xy / resolution.xy;",
            "vec3 oldVelocity = texture2D( textureVelocity, uv ).xyz;",
            "vec3 acceleration = texture2D( textureAcceleration, uv).xyz;",

            "vec3 velocity=oldVelocity+acceleration*dt;",

            "gl_FragColor=vec4(velocity, 1.0);",

            "}"

        ].join("\n")


    })},

    //calculates new acceleration of each paticle
    getAccelerationShader: function(){return new THREE.ShaderMaterial({

        uniforms: {
            dt : { type: "f",value: gui.vars().dt},
            gy: {type: "f", value: gui.vars().gy},
            drag: {type: "f", value: gui.vars().drag},
            gridsize: {type: "f", value:null},
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            textureVelocity: { type: "t", value: null},
            textureMQ: {type:"t", value: null},
            textureGridB: {type: "t", value: null},
            textureGridE: {type: "t", value: null},
            texturePosition: {type: "t", value: null}

        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform float dt;",
            "uniform float gy;",
            "uniform float drag;",
            "uniform vec2 resolution;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D textureMQ;",

            "uniform float gridsize;",
            "uniform sampler2D textureGridB;",
            "uniform sampler2D textureGridE;",
            "uniform sampler2D texturePosition;",


            //returns the lookup vector for grid texture by
            //calculating nearest grd point to the particles position pos
            "vec2 getGridPoint(vec3 pos){",

                "float maxval = 400.0;",

                //map particles position  to [0,size]
                "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
                "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
                "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

                //now round to nearest fp
                "float lx = floor(x);",
                "float ly = floor(y);",
                "float lz = floor(z)+0.5;", //workaround for rounding errors

                "float width = ceil(sqrt(gridsize));",
                "width = abs(width);", //workaround for strange bug on some systems

                "float row = floor(lz/width);",
                "float col = floor(mod(lz,width));",//workaround for rounding errors

                "float qu = col*(gridsize)+lx;",
                "float qv = row*(gridsize)+ly;",

                "qu = (qu+0.5)/(gridsize*width);",
                "qv = (qv+0.5)/(gridsize*width);",

                "return vec2(qu,qv);",


                "}",

            "void main()	{",

                "vec2 uv = gl_FragCoord.xy / resolution.xy;",

                "vec3 pos = texture2D(texturePosition,uv).xyz;",

                "vec2 quv = getGridPoint(pos);",


                "vec3 B = texture2D(textureGridB,quv).xyz;",
                "vec3 E = texture2D(textureGridE,quv).xyz;",

                "float q = texture2D(textureMQ,uv).y;",
                "float m = texture2D(textureMQ,uv).x;",

                "vec3 v = texture2D(textureVelocity,uv).xyz;",
                "vec3 acceleration =  -drag * v + m*vec3(0.0,gy,0.0) + (q/m*(E+cross(v,B)));",

                "gl_FragColor=vec4(acceleration,1.0);",


                "}"


        ].join("\n")


    })},

    //calculates new electric field at every grid point
    getGridEShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            dt : { type: "f",value: null},
            gridsize: {type: "f",value: gui.vars().gridsize},
            mu0 : {type: "f", value: gui.vars().mu0},
            eps0: {type: "f", value: gui.vars().eps0},
            textureGridE:{type: "t",value :null},
            textureGridB:{type: "t",value :null},
            textureGridJ:{type:"t",value: null}
        },

        vertexShader: [
            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform sampler2D textureGridE;",
            "uniform sampler2D textureGridB;",
            "uniform sampler2D textureGridJ;",
            "uniform float dt;",
            "uniform float gridsize;",
            "uniform float mu0;",
            "uniform float eps0;",



            "float width = ceil(sqrt(gridsize));",


            "vec4 getSteps(vec2 uv,float h){",

            "width = abs(width);", //workaround for strange bug on some systems

            //calculate new uv vector if x changes by +h

            "float x = uv.x*(gridsize*width);",
            "float col = floor(uv.x*width);",
            "float localx = x-col*gridsize;",
            "localx = mod((localx+h),gridsize);",
            "x=col*gridsize+localx;",

            "x = x/(gridsize*width);",


            //calculate new uv vector if y changes by +h

            "float y = uv.y*(gridsize*width);",
            "float row = floor(uv.y*width);",
            "float localy = y-row*gridsize;",
            "localy = mod((localy+h),gridsize);",
            "y = row*gridsize+localy;",

            "y = y/(gridsize*width);",


            //calculate new uv vector if z changes by +h

            "vec2 zuv=uv;",
            "float posz = col+row*width;",
            "posz=floor(mod((posz+h+0.5),gridsize));",
            "if(posz==gridsize){posz=0.0;}",//workaround: for rounding error at gridsize=7,14,15....


            "float tx = uv.x*(gridsize*width);",
            "float ty = uv.y*(gridsize*width);",

            //per tile coordinate
            "localx = tx - col*gridsize;",

            "localy = ty - row*gridsize;",

            //new col and row
            "col = floor(mod(posz+0.5,width));",
            "row = floor((posz+0.5)/width);",

            "zuv.x = col * gridsize + localx;",
            "zuv.x = (zuv.x)/(gridsize*width);",

            "zuv.y = row * gridsize + localy;",
            "zuv.y = (zuv.y)/(gridsize*width);",

            "return vec4(x,y,zuv.x, zuv.y);",


            "}",


            "vec3 rotorNeg(vec2 uv){",

                "float h = 1.0;",

                "vec4 vecuv = getSteps(uv,-h);",

                "vec3 bold = texture2D(textureGridB,uv).xyz;",

                "vec3 dx = texture2D(textureGridB, vec2(vecuv.x,uv.y)).xyz;",
                "vec3 dy = texture2D(textureGridB, vec2(uv.x,vecuv.y)).xyz;",
                "vec3 dz = texture2D(textureGridB, vec2(vecuv.z,vecuv.w)).xyz;",


                "float rxl = (bold.z-dy.z)/h;",
                "float rxr = (bold.y-dz.y)/h;",

                "float ryl = (bold.x-dz.x)/h;",
                "float ryr = (bold.z-dx.z)/h;",

                "float rzl = (bold.y-dx.y)/h;",
                "float rzr = (bold.x-dy.x)/h;",


                "float rx = rxl-rxr;",
                "float ry = ryl-ryr;",
                "float rz = rzl-rzr;",

                //"if(vecuv.y==0.0){return vec3(0.0,0.1,0.0);}else{return vec3(0.0,0.0,0.0);}",
                "return vec3(rx,ry,rz);",


            "}",


            "void main(){",

            "width = abs(width);", //workaround for strange bug on some systems

            "vec2 uv = vec2(gl_FragCoord.x/(gridsize*width),gl_FragCoord.y/(gridsize*width));",


                "vec3 rotB = rotorNeg(uv);",
                "vec3 j =  texture2D(textureGridJ,uv).xyz;",
                "vec3 E_old = texture2D(textureGridE,uv).xyz;",
                "vec3 E_new =  E_old + dt*(rotB-mu0*j)/eps0;",



                "gl_FragColor=vec4(E_new, 1.0);",


            "}"


        ].join("\n")

    })},
    //calculates new magnetic field at every gridpoint
    getGridBShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            dt : { type: "f",value: null},
            gridsize: {type: "f",value: gui.vars().gridsize},
            textureGridE:{type: "t",value :null},
            textureGridB:{type: "t",value :null}

        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform sampler2D textureGridE;",
            "uniform sampler2D textureGridB;",
            "uniform float dt;",
            "uniform float gridsize;",


            "float width = ceil(sqrt(gridsize));",


            "vec4 getSteps(vec2 uv,float h){",

                "width = abs(width);", //workaround for strange bug on some systems

            //calculate new uv vector if x changes by +h

                "float x = uv.x*(gridsize*width);",
                "float col = floor(uv.x*width);",
                "float localx = x-col*gridsize;",
                "localx = mod((localx+h),gridsize);",
                "x=col*gridsize+localx;",

                "x = x/(gridsize*width);",


                //calculate new uv vector if y changes by +h

                "float y = uv.y*(gridsize*width);",
                "float row = floor(uv.y*width);",
                "float localy = y-row*gridsize;",
                "localy = mod((localy+h),gridsize);",
                "y = row*gridsize+localy;",

                "y = y/(gridsize*width);",


                //calculate new uv vector if z changes by +h

                "vec2 zuv=uv;",
                "float posz = col+row*width;",
                "posz=floor(mod((posz+h+0.5),gridsize));",
                "if(posz==gridsize){posz=0.0;}",//workaround: for rounding error at gridsize=7,14,15....


                "float tx = uv.x*(gridsize*width);",
                "float ty = uv.y*(gridsize*width);",

                //per tile coordinate
                "localx = tx - col*gridsize;",

                "localy = ty - row*gridsize;",

                //new col and row
                "col = floor(mod(posz+0.5,width));",
                "row = floor((posz+0.5)/width);",

                "zuv.x = col * gridsize + localx;",
                "zuv.x = (zuv.x)/(gridsize*width);",

                "zuv.y = row * gridsize + localy;",
                "zuv.y = (zuv.y)/(gridsize*width);",

                "return vec4(x,y,zuv.x, zuv.y);",


                "}",

            "vec3 rotor(vec2 uv){",

                "float h =1.0;",
                "vec4 vecuv = getSteps(uv,h);",


                "vec3 eold = texture2D(textureGridE, uv).xyz;",
                "vec3 dx = texture2D(textureGridE, vec2(vecuv.x,uv.y)).xyz;",
                "vec3 dy = texture2D(textureGridE, vec2(uv.x,vecuv.y)).xyz;",
                "vec3 dz = texture2D(textureGridE, vec2(vecuv.z,vecuv.w)).xyz;",

                "float rxl = (dy.z-eold.z)/h;",
                "float rxr = (dz.y-eold.y)/h;",

                "float ryl = (dz.x-eold.x)/h;",
                "float ryr = (dx.z-eold.z)/h;",

                "float rzl = (dx.y-eold.y)/h;",
                "float rzr = (dy.x-eold.x)/h;",



                "float rx = rxl-rxr;",
                "float ry = ryl-ryr;",
                "float rz = rzl-rzr;",



                "return vec3(rx,ry,rz);",

            "}",


            "void main(){",

            "width = abs(width);", //workaround for strange bug on some systems


            "vec2 uv = vec2(gl_FragCoord.x/(gridsize*width),gl_FragCoord.y/(gridsize*width));",

                "vec3 rotE = rotor(uv);",
                "vec3 B_old = texture2D(textureGridB,uv).xyz;",
                "vec3 B_new = B_old - dt*rotE;",

                "gl_FragColor=vec4(B_new, 1.0);",


            "}"


        ].join("\n")

    })},
    //calculates current density at every grid point

    getGridJShader: function(){

        return new THREE.ShaderMaterial({
    //fixme: replace the for loops with something better
        uniforms:{

            gridsize: {type: "f",value: gui.vars().gridsize},
            dt:{type:"f",value:gui.vars().dt},
            jscale:{type:"f",value:gui.vars().jscale},
            pcount:{type:"f", value: gui.vars().Particles},
            texturePosition:{type: "t",value :null},
            textureVelocity:{type: "t",value :null}


        },

        vertexShader: [

            "void main(){ ",
            "gl_Position = vec4( position, 1.0 );",
            "}"

        ].join("\n"),
        fragmentShader: [


        "uniform float gridsize;",
        "uniform float dt;",
        "uniform float pcount;",
        "uniform float jscale;",


        "uniform sampler2D texturePosition;",
        "uniform sampler2D textureVelocity;",
        "vec2 resolution = vec2(ceil(sqrt(gridsize))*gridsize,ceil(sqrt(gridsize))*gridsize);",


            "vec2 getGridPoint(vec3 pos){",

            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z)+0.5;",

            "float width = ceil(sqrt(gridsize));",
            "width = abs(width);", //workaround for strange bug on some systems


            "float row = floor(lz/width);",
            "float col = floor(mod(lz,width));",

            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",

            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",

            "return vec2(qu,qv);",


            "}",


        "void main(){",

            "int maxIter = int(pcount);",
            "float LOWER_BOUNDS = -200.0;",
            "float UPPER_BOUNDS = 200.0;",
            "vec2 uv = gl_FragCoord.xy/resolution.xy;",
            "vec3 j = vec3(0.0,0.0,0.0);",


            "for(int y = 0; y<"+ PWIDTH +";y++){",

                "for(int x = 0; x <"+ PWIDTH+";x++){",
                    "maxIter-=1;",
                    "if(maxIter>=0){",
                    "vec2 look = vec2((float(x)+0.5)/float("+PWIDTH+"),(float(y)+0.5)/float("+PWIDTH+"));",
                    "vec3 position = texture2D(texturePosition,look).xyz;",
                    "vec3 velocity = texture2D(textureVelocity,look).xyz;",
                    "vec2 gp = getGridPoint(position);",
                    "if(abs(gp.x-uv.x)<=0.0001&&abs(gp.y-uv.y)<=0.0001){",

                         "j+=velocity*jscale;",//scale it down a little
                         //"j=vec3(0.0,1.1,0.02);",

                    "}",


                 "}",



                "}",

            "}",

           //"if(j.x>1.0||j.y>1.0||j.z>10.0){j=vec3(1.0,1.0,1.0);}",
           "gl_FragColor=vec4(j,1.0);",


        "}"

        ].join("\n")

    })},

    //the following shaders calculate the new positions of the endpoints of every vector
    getVectorEShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            gridsize:{type: "f", value: gui.vars().gridsize},
            vectorscale:{type: "f", value: gui.vars().vectorscale},
            textureGridE:{type:"t", value:null},
            textureGridJ:{type:"t", value:null}

        },

        vertexShader : [


        "uniform sampler2D textureGridE;",
        "uniform float gridsize;",
        "uniform float vectorscale;",

        "vec2 getUV(vec3 pos){",


            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z)+0.5;",


            "float width = ceil(sqrt(gridsize));",
            "width = abs(width);", //workaround for strange bug on some systems



            "float row = floor(lz/width);",
            "float col = floor(mod(lz,width));",


            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",



            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",


            "return vec2(qu,qv);",


        "}",

        "void main() {",


            "vec4 mvPosition;",

            "mvPosition = modelViewMatrix * vec4( position, 1.0 );",


            "if(position.y>200.0){",
                "vec2 uv = getUV(vec3(position.x,position.y-1000.0,position.z));",
                "vec3 E = texture2D(textureGridE,uv).xyz;",
                "vec3 pos = vec3(position.x,position.y-1000.0,position.z);",
                "pos = pos +E*vectorscale;",
                "mvPosition = modelViewMatrix * vec4(pos,1.0);",
            "}",

            "gl_Position = projectionMatrix * mvPosition;",


        "}"

        ].join('\n'),

        fragmentShader : [
            "vec3 vColor = vec3(1.0,0.0,1.0);",

            "void main() {",

            "gl_FragColor =  vec4( vColor, 1.0 );",

            "}"
        ].join('\n')

    })},

    getVectorBShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            gridsize:{type: "f", value: gui.vars().gridsize},
            vectorscale:{type: "f", value: gui.vars().vectorscale},
            textureGridB:{type:"t", value:null}
        },

        vertexShader : [
            "uniform sampler2D textureGridB;",
            "uniform float gridsize;",
            "uniform float vectorscale;",


            "vec2 getUV(vec3 pos){",


            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z)+0.5;",


            "float width = ceil(sqrt(gridsize));",
            "width = abs(width);", //workaround for strange bug on some systems



            "float row = floor(lz/width);",
            "float col = floor(mod(lz,width));",


            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",



            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",


            "return vec2(qu,qv);",


            "}",

            "void main() {",


            "vec4 mvPosition;",

            "mvPosition = modelViewMatrix * vec4( position, 1.0 );",


            "if(position.y>200.0){",
            "vec2 uv = getUV(vec3(position.x,position.y-1000.0,position.z));",
            "vec3 B = texture2D(textureGridB,uv).xyz;",
            "vec3 pos = vec3(position.x,position.y-1000.0,position.z);",
            "pos = pos +B*vectorscale;",
            "mvPosition = modelViewMatrix * vec4(pos,1.0);",
            "}",

            "gl_Position = projectionMatrix * mvPosition;",


            "}"


        ].join('\n'),

        fragmentShader : [
            "vec3 vColor = vec3(1.0,1.0,0.0);",

            "void main() {",

            "gl_FragColor =  vec4( vColor, 1.0 );",

            "}"
        ].join('\n')


    })},

    getVectorJShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            gridsize:{type: "f", value: gui.vars().gridsize},
            vectorscale:{type: "f", value: gui.vars().vectorscale},
            textureGridJ:{type:"t", value:null}

        },

        vertexShader : [


            "uniform float gridsize;",
            "uniform float vectorscale;",
            "uniform sampler2D textureGridJ;",


            "vec2 getUV(vec3 pos){",


            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z)+0.5;",


            "float width = ceil(sqrt(gridsize));",
            "width = abs(width);", //workaround for strange bug on some systems



            "float row = floor(lz/width);",
            "float col = floor(mod(lz,width));",


            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",



            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",


            "return vec2(qu,qv);",


            "}",

            "void main() {",


            "vec4 mvPosition;",

            "mvPosition = modelViewMatrix * vec4( position, 1.0 );",


            "if(position.y>200.0){",
            "vec2 uv = getUV(vec3(position.x,position.y-1000.0,position.z));",
            "vec3 j = texture2D(textureGridJ,uv).xyz;",
            "vec3 pos = vec3(position.x,position.y-1000.0,position.z);",
            "pos = pos +j*vectorscale;",
            "mvPosition = modelViewMatrix * vec4(pos,1.0);",
            "}",

            "gl_Position = projectionMatrix * mvPosition;",


            "}"

        ].join('\n'),

        fragmentShader : [
            "vec3 vColor = vec3(0.0,1.0,1.0);",

            "void main() {",

            "gl_FragColor =  vec4( vColor, 1.0 );",

            "}"
        ].join('\n')

    })},

    //from: http://concord-consortium.github.io/lab/experiments/webgl-gpgpu/webgl.html
    getEncodeShader: function(xyzw){return new THREE.ShaderMaterial({


        uniforms: {
            texture:{type:"t",value:null}
        },

        vertexShader: [

            "varying vec2 coord;",
            "void main(){",
            "coord = position.xy * 0.5 + 0.5;",
            "gl_Position = vec4(position, 1.0);",
            "}"

        ].join('\n'),

        fragmentShader: [

            "uniform sampler2D texture;",
            "varying vec2 coord;",

            "float shift_right(float v, float amt){",
            "v = floor(v) + 0.5;",
            "return floor(v / exp2(amt));",
            "}",

            "float shift_left(float v, float amt){",
            "return floor(v * exp2(amt) + 0.5);",
            "}",

            "float mask_last(float v, float bits) {",
            "return mod(v, shift_left(1.0, bits));",
            "}",

            "float extract_bits(float num, float from, float to) {",
            "from = floor(from + 0.5);",
            "to = floor(to + 0.5);",
            "return mask_last(shift_right(num, from), to - from);",
            "}",

            "vec4 encode_float(float val) {",
            "if (val == 0.0)",
            "return vec4(0, 0, 0, 0);",
            "float sign = val > 0.0 ? 0.0 : 1.0;",
            "val = abs(val);",
            "float exponent = floor(log2(val));",
            "float biased_exponent = exponent + 127.0;",
            "float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;",
            "float t = biased_exponent / 2.0;",
            "float last_bit_of_biased_exponent = fract(t) * 2.0;",
            "float remaining_bits_of_biased_exponent = floor(t);",
            "float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;",
            "float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;",
            "float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;",
            "float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;",
            "return vec4(byte4, byte3, byte2, byte1);",
            "}",


            "void main() {",
            "vec4 data = texture2D(texture, coord);",

            "gl_FragColor = encode_float(data."+xyzw+");",
            "}"


        ].join('\n')


    })}





}