
			var camera, controls, renderer, composer;
			var updateDistortionEffect;

			init();
			animate();

			function init() {
				renderer = new THREE.WebGLRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
	
				window.addEventListener( 'resize', onWindowResize, false );
				
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000000 );
				camera.position.z = 800;
				
				controls = new THREE.OrbitControls( camera, renderer.domElement );

				scene = buildScene();

				composer = new THREE.EffectComposer( renderer );
				composer.addPass( new THREE.RenderPass( scene, camera ) );

				var effect = new THREE.ShaderPass( getDistortionShaderDefinition() );
				composer.addPass( effect );
				effect.renderToScreen = true;
				
				setupDistortionEffectAndGUI(effect);
			}
			
			function animate() {
				requestAnimationFrame( animate );
				composer.render();
				controls.update();
			}
			
			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				
				updateDistortionEffect();

				renderer.setSize( window.innerWidth, window.innerHeight );
				composer.setSize( window.innerWidth, window.innerHeight );
			}

			function setupDistortionEffect(effect)
			{
				var guiParameters = {
					horizontalFOV:		140,
					strength: 			0.5,
					cylindricalRatio:	2,
				};				

				updateDistortionEffect = function( ) {
					
					var height = Math.tan(THREE.Math.degToRad(guiParameters.horizontalFOV) / 2) / camera.aspect;

					camera.fov = Math.atan(height) * 2 * 180 / 3.1415926535;
					camera.updateProjectionMatrix();
					
					effect.uniforms[ "strength" ].value = guiParameters.strength;
					effect.uniforms[ "height" ].value = height;
					effect.uniforms[ "aspectRatio" ].value = camera.aspect;
					effect.uniforms[ "cylindricalRatio" ].value = guiParameters.cylindricalRatio;
				};		
				
				updateDistortionEffect();
			}
			
			function buildScene()
			{
				scene = new THREE.Scene();
				
				object = new THREE.Object3D();
				scene.add( object );
						
				// add block stack
				for ( var x = -1; x <= 1; x ++ ) {
					for ( var y = -1; y <= 1; y ++ ) { 
						for ( var z = -1; z <= 1; z ++ ) {
							var mesh = generateCubeMesh(1);
							mesh.position.set(160 * x, 160 * y, 160 * z);
							object.add( mesh );
						}
					}
				}
				
				// add floor tiles
				for ( var x = -9; x <= 9; x += 3 ) {
					for ( var z = -9; z <= 9; z += 3 ) {
						var mesh = generateCubeMesh(Math.min(1, Math.max(0, (200 - x * x - z * z) / 100 * (x * x + z * z + 15) / 120)));
						mesh.position.set(160 * x, -900, 160 * z);
						mesh.scale.set(3,0.08,3);
						object.add( mesh );
					}
				}				
				
				// add 4 bigger blocks
				for ( var x = -1; x <= 1; x += 2 ) {
					for ( var z = -1; z <= 1; z += 2 ) {
						var mesh = generateCubeMesh(1);
						mesh.position.set(1440 * x, 0, 1440 * z);
						mesh.scale.set(3,3,3);
						object.add( mesh );
					}
				}
							
				// add sky cube
				var path = "cube/"; // Load cube texture provided by Emil Persson, aka Humus. See cube/readme.txt for the license details.
				var format = '.jpg';
				var urls = [path + 'posx' + format, path + 'negx' + format,
							path + 'posy' + format, path + 'negy' + format,
							path + 'posz' + format, path + 'negz' + format];
				var skyTextureCube = THREE.ImageUtils.loadTextureCube( urls );
				skyTextureCube.format = THREE.RGBFormat;	

				var skyCubeShader = THREE.ShaderLib[ "cube" ];
				skyCubeShader.uniforms[ "tCube" ].value = skyTextureCube;

				var material = new THREE.ShaderMaterial( {
					fragmentShader: skyCubeShader.fragmentShader,
					vertexShader: skyCubeShader.vertexShader,
					uniforms: skyCubeShader.uniforms,
					side: THREE.BackSide
				} ),

				skyCubeMesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000 ), material );
				scene.add( skyCubeMesh );				

				// add some lights				
				light = new THREE.DirectionalLight( 0xFFEEBB );
				light.position.set( 0, 0.5, 1 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0x223333 );
				light.position.set( 1, -.15, -0.22 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0x223333 );
				light.position.set( -1, -.15, -0.22 );
				scene.add( light );
				
				return scene;
			}
		
			function generateCubeMesh(intensity) {
				var randomColor = Math.round(intensity * (128 + 127 * Math.random())) * 0x010000 + 
								  Math.round(intensity * (128 + 127 * Math.random())) * 0x000100 + 
								  Math.round(intensity * (128 + 127 * Math.random())) * 0x000001;
								  
				var material = new THREE.MeshLambertMaterial( { 
					color: randomColor,
					shading: THREE.FlatShading,
				} );
				
				var geometry = new THREE.CubeGeometry( 140, 140, 140 );				

				return new THREE.Mesh( geometry, material );
			}
			
			function getDistortionShaderDefinition()
			{
				return {
				
					uniforms: {
						"tDiffuse": 		{ type: "t", value: null },
						"strength": 		{ type: "f", value: 0 },
						"height": 			{ type: "f", value: 1 },
						"aspectRatio":		{ type: "f", value: 1 },
						"cylindricalRatio": { type: "f", value: 1 }
					},

					vertexShader: [
						"uniform float strength;",          // s: 0 = perspective, 1 = stereographic
						"uniform float height;",            // h: tan(verticalFOVInRadians / 2)
						"uniform float aspectRatio;",       // a: screenWidth / screenHeight
						"uniform float cylindricalRatio;",  // c: cylindrical distortion ratio. 1 = spherical
						 
						"varying vec3 vUV;",                // output to interpolate over screen
						"varying vec2 vUVDot;",             // output to interpolate over screen
						 
						"void main() {",
							"gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",
						 
							"float scaledHeight = strength * height;",
							"float cylAspectRatio = aspectRatio * cylindricalRatio;",
							"float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
							"float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
							"vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",
						 
							"float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
							"float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",
						 
							"vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
							"vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
							"vUV.xy += uv;",
						"}"
					].join("\n"),
					
					fragmentShader: [
						"uniform sampler2D tDiffuse;",      // sampler of rendered scene’s render target
						"varying vec3 vUV;",                // interpolated vertex output data
						"varying vec2 vUVDot;",             // interpolated vertex output data
 
						"void main() {",
							"vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
							"gl_FragColor = texture2DProj(tDiffuse, uv);",
						"}"
					].join("\n")

				};
			}
		