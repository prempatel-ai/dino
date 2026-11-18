(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();const F={WIDTH:600,FPS:60,SPEED:6,MAX_SPEED:13,ACCELERATION:.001,CLEAR_TIME:3e3,GAP_COEFFICIENT:.6,MAX_GAP_COEFFICIENT:1.5,MAX_OBSTACLE_LENGTH:3,MAX_OBSTACLE_DUPLICATION:2,GAMEOVER_CLEAR_TIME:750,GRAVITY:.6,INVERT_DISTANCE:700,MAX_CLOUDS:6,CLOUD_FREQUENCY:.5},y={WIDTH:44,HEIGHT:47,WIDTH_DUCK:59,HEIGHT_DUCK:25,START_X_POS:50,GROUND_Y_POS:93,INITIAL_JUMP_VELOCITY:-10,DROP_VELOCITY:-5,MIN_JUMP_HEIGHT:30,MAX_JUMP_HEIGHT:30,SPEED_DROP_COEFFICIENT:3,INTRO_DURATION:1500},O={COEFFICIENT:.025,MAX_SCORE:99999,FLASH_DURATION:250,FLASH_ITERATIONS:3},I={CLOUD_WIDTH:46,CLOUD_MIN_Y:30,CLOUD_MAX_Y:71,CLOUD_MIN_GAP:100,CLOUD_MAX_GAP:400,CLOUD_SPEED:.2},$=[{x:22,y:0,w:17,h:16},{x:1,y:18,w:30,h:9},{x:10,y:35,w:14,h:8},{x:1,y:24,w:29,h:5},{x:5,y:30,w:21,h:4},{x:9,y:34,w:15,h:4}],K=[{x:1,y:18,w:55,h:25}],Z={CACTUS_SMALL:{type:"CACTUS_SMALL",width:17,height:35,yPos:105,minGap:120,minSpeed:0,multipleSpeed:4,frames:1,collisionBoxes:[{x:0,y:7,w:5,h:27},{x:4,y:0,w:6,h:34},{x:10,y:4,w:7,h:14}]},CACTUS_LARGE:{type:"CACTUS_LARGE",width:25,height:50,yPos:90,minGap:120,minSpeed:0,multipleSpeed:7,frames:1,collisionBoxes:[{x:0,y:12,w:7,h:38},{x:8,y:0,w:7,h:49},{x:13,y:10,w:10,h:38}]},PTERODACTYL:{type:"PTERODACTYL",width:46,height:40,yPos:100,yPosList:[100,75,50],minGap:150,minSpeed:8.5,multipleSpeed:999,frames:2,frameRate:6,speedOffset:.8,collisionBoxes:[{x:15,y:15,w:16,h:5},{x:18,y:21,w:24,h:6},{x:2,y:14,w:4,h:3},{x:6,y:10,w:4,h:7},{x:10,y:8,w:6,h:9}]}};class J{s;constructor(t=1337){this.s=t|0}setSeed(t){this.s=t|0}next(){let t=this.s+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}int(t,e){return Math.floor(this.next()*(e-t+1))+t}}class tt{x=y.START_X_POS;y=y.GROUND_Y_POS;w=y.WIDTH;h=y.HEIGHT;ducking=!1;jumping=!1;jumpVelocity=0;reachedMinHeight=!1;speedDrop=!1;frame=0;animTimer=0;isAirDuckPending=!1;constructor(){this.reset()}reset(){this.x=y.START_X_POS,this.y=y.GROUND_Y_POS,this.w=y.WIDTH,this.h=y.HEIGHT,this.ducking=!1,this.jumping=!1,this.jumpVelocity=0,this.reachedMinHeight=!1,this.speedDrop=!1,this.frame=0,this.animTimer=0,this.isAirDuckPending=!1}startJump(t){return this.jumping||this.ducking?!1:(this.jumping=!0,this.jumpVelocity=y.INITIAL_JUMP_VELOCITY-t/10,this.reachedMinHeight=!1,this.speedDrop=!1,!0)}updateJump(t=1){if(!this.jumping)return!1;this.speedDrop?this.y+=Math.round(this.jumpVelocity*y.SPEED_DROP_COEFFICIENT*t):this.y+=Math.round(this.jumpVelocity*t),this.jumpVelocity+=F.GRAVITY*t;const e=y.GROUND_Y_POS-y.MIN_JUMP_HEIGHT;return(this.y<e||this.speedDrop)&&(this.reachedMinHeight=!0),(this.y<y.MAX_JUMP_HEIGHT||this.speedDrop)&&this.endJump(),this.y>y.GROUND_Y_POS?(this.land(),!0):!1}endJump(){this.reachedMinHeight&&this.jumpVelocity<y.DROP_VELOCITY&&(this.jumpVelocity=y.DROP_VELOCITY)}land(){this.y=y.GROUND_Y_POS,this.jumping=!1,this.jumpVelocity=0,this.speedDrop=!1,this.reachedMinHeight=!1,this.isAirDuckPending?(this.isAirDuckPending=!1,this.setDuck(!0)):this.ducking?(this.y=y.GROUND_Y_POS+(y.HEIGHT-y.HEIGHT_DUCK),this.w=y.WIDTH_DUCK,this.h=y.HEIGHT_DUCK):(this.w=y.WIDTH,this.h=y.HEIGHT)}setSpeedDrop(t){this.speedDrop=t,t&&this.jumping&&(this.jumpVelocity=1)}setDuck(t){if(this.jumping){this.setSpeedDrop(t),this.isAirDuckPending=t;return}this.isAirDuckPending=!1,t?(this.ducking=!0,this.w=y.WIDTH_DUCK,this.h=y.HEIGHT_DUCK,this.y=y.GROUND_Y_POS+(y.HEIGHT-y.HEIGHT_DUCK)):(this.ducking=!1,this.w=y.WIDTH,this.h=y.HEIGHT,this.y=y.GROUND_Y_POS)}updateAnim(t=1){if(this.jumping){this.frame=0;return}this.animTimer+=t,this.animTimer>=5&&(this.animTimer=0,this.frame=(this.frame+1)%2)}getState(){return{x:this.x,y:this.y,w:this.w,h:this.h,ducking:this.ducking,jumping:this.jumping,jumpVelocity:this.jumpVelocity,reachedMinHeight:this.reachedMinHeight,speedDrop:this.speedDrop,frame:this.frame,animTimer:this.animTimer}}}class N{type;x;y;w;h;size;gap;speedOffset;frame;animTimer;followingObstacleCreated;collisionBoxes;constructor(t,e,s,i){if(this.type=t.type,this.size=e,this.w=t.width*e,this.h=t.height,this.x=F.WIDTH,this.followingObstacleCreated=!1,this.frame=0,this.animTimer=0,this.type==="PTERODACTYL"){const o=t.yPosList??[100,75,50],n=i.int(0,o.length-1);this.y=o[n];const a=i.next()<.5?-1:1;this.speedOffset=a*(t.speedOffset??.8)}else this.y=t.yPos,this.speedOffset=0;this.gap=N.getGap(this.w,t.minGap,F.GAP_COEFFICIENT,s,i),this.collisionBoxes=N.createCollisionBoxes(t,this.size,this.w)}static getGap(t,e,s,i,o){const n=Math.round(t*i+e*s),a=Math.round(n*F.MAX_GAP_COEFFICIENT);return o.int(n,a)}static createCollisionBoxes(t,e,s){const i=t.collisionBoxes.map(o=>({...o}));return e>1&&i.length===3&&(i[1].w=s-i[0].w-i[2].w,i[2].x=s-i[2].w),i}static create(t,e,s){const i=Z[t];let o=s.int(1,F.MAX_OBSTACLE_LENGTH);return o>1&&i.multipleSpeed>e&&(o=1),new N(i,o,e,s)}isVisible(){return this.x+this.w>0}update(t,e=1){const s=t+this.speedOffset;this.x-=Math.floor(s*e),this.type==="PTERODACTYL"&&(this.animTimer+=e,this.animTimer>=10&&(this.animTimer=0,this.frame=(this.frame+1)%2))}getState(){return{type:this.type,x:this.x,y:this.y,w:this.w,h:this.h,size:this.size,gap:this.gap,speedOffset:this.speedOffset,frame:this.frame,animTimer:this.animTimer,followingObstacleCreated:this.followingObstacleCreated,collisionBoxes:this.collisionBoxes}}}class et{x=F.WIDTH;y;gap;constructor(t){this.y=t.int(I.CLOUD_MIN_Y,I.CLOUD_MAX_Y),this.gap=t.int(I.CLOUD_MIN_GAP,I.CLOUD_MAX_GAP)}update(t=1){this.x-=I.CLOUD_SPEED*t}isVisible(){return this.x+I.CLOUD_WIDTH>0}}class st{groundOffset=0;clouds=[];obstacles=[];obstacleHistory=[];runningTimeMs=0;rng;constructor(t){this.rng=t,this.reset()}reset(){this.groundOffset=0,this.clouds=[],this.obstacles=[],this.obstacleHistory=[],this.runningTimeMs=0}update(t,e=1){this.runningTimeMs+=e*(1e3/F.FPS),this.groundOffset=(this.groundOffset+Math.floor(t*e))%F.WIDTH,this.updateClouds(e),this.updateObstacles(t,e)}updateClouds(t){for(let e=this.clouds.length-1;e>=0;e--)this.clouds[e].update(t),this.clouds[e].isVisible()||this.clouds.splice(e,1);if(this.clouds.length<F.MAX_CLOUDS){const e=this.clouds[this.clouds.length-1];(!e||F.WIDTH-e.x>e.gap&&this.rng.next()>F.CLOUD_FREQUENCY)&&this.clouds.push(new et(this.rng))}}updateObstacles(t,e){for(let s=this.obstacles.length-1;s>=0;s--)this.obstacles[s].update(t,e),this.obstacles[s].isVisible()||this.obstacles.splice(s,1);if(!(this.runningTimeMs<F.CLEAR_TIME))if(this.obstacles.length===0)this.addNewObstacle(t);else{const s=this.obstacles[this.obstacles.length-1];!s.followingObstacleCreated&&s.isVisible()&&s.x+s.w+s.gap<F.WIDTH&&(this.addNewObstacle(t),s.followingObstacleCreated=!0)}}addNewObstacle(t){const e=[],s=["CACTUS_SMALL","CACTUS_LARGE","PTERODACTYL"];for(const n of s)Z[n].minSpeed>t||this.isDuplicateType(n)||e.push(n);e.length===0&&e.push("CACTUS_SMALL");const i=e[this.rng.int(0,e.length-1)],o=N.create(i,t,this.rng);this.obstacles.push(o),this.obstacleHistory.push(i)}isDuplicateType(t){const e=this.obstacleHistory.length;if(e<F.MAX_OBSTACLE_DUPLICATION)return!1;for(let s=1;s<=F.MAX_OBSTACLE_DUPLICATION;s++)if(this.obstacleHistory[e-s]!==t)return!1;return!0}getObstacleStates(){return this.obstacles.map(t=>t.getState())}getCloudStates(){return this.clouds.map(t=>({x:t.x,y:t.y,gap:t.gap}))}}class it{distance=0;score=0;highScore=0;isFlashing=!1;flashIterations=0;flashTimerMs=0;lastMilestoneScore=0;constructor(t=0){this.highScore=t,this.reset()}reset(){this.distance=0,this.score=0,this.isFlashing=!1,this.flashIterations=0,this.flashTimerMs=0,this.lastMilestoneScore=0}setHighScore(t){this.highScore=Math.max(this.highScore,t)}update(t,e=1,s=1e3/60){let i=!1,o=!1;this.distance+=t*e;const n=Math.min(Math.round(this.distance*O.COEFFICIENT),O.MAX_SCORE);return n>0&&Math.floor(n/100)>Math.floor(this.lastMilestoneScore/100)&&(i=!0,this.lastMilestoneScore=n,this.isFlashing=!0,this.flashIterations=0,this.flashTimerMs=0),n>this.highScore&&this.highScore>0&&this.score<=this.highScore&&(o=!0),this.score=n,this.isFlashing&&(this.flashTimerMs+=e*s,this.flashTimerMs>=O.FLASH_DURATION&&(this.flashTimerMs-=O.FLASH_DURATION,this.flashIterations++,this.flashIterations>=O.FLASH_ITERATIONS*2&&(this.isFlashing=!1,this.flashIterations=0,this.flashTimerMs=0))),{milestoneAchieved:i,newHighScore:o}}onCrash(){let t=!1;return this.score>this.highScore&&(this.highScore=this.score,t=!0),t}}class nt{isNight=!1;nightFade=0;moonPhase=0;lastInvertScore=0;constructor(){this.reset()}reset(){this.isNight=!1,this.nightFade=0,this.moonPhase=0,this.lastInvertScore=0}update(t,e=1,s=1e3/60){let i=!1,o=!1;t>0&&Math.floor(t/F.INVERT_DISTANCE)>Math.floor(this.lastInvertScore/F.INVERT_DISTANCE)&&(this.isNight=!this.isNight,i=!0,o=!0,this.lastInvertScore=t,this.isNight&&(this.moonPhase=(this.moonPhase+1)%7));const n=this.isNight?1:0,a=e*s/1e3;return this.nightFade<n?this.nightFade=Math.min(n,this.nightFade+a):this.nightFade>n&&(this.nightFade=Math.max(n,this.nightFade-a)),{inverted:i,biomeChanged:o}}}function _(d,t){return d.x<t.x+t.w&&d.x+d.w>t.x&&d.y<t.y+t.h&&d.y+d.h>t.y}function Y(d,t){const e={x:d.x+1,y:d.y+1,w:d.w-2,h:d.h-2},s={x:t.x+1,y:t.y+1,w:t.w-2,h:t.h-2};if(!_(e,s))return!1;const i=d.ducking?K:$,o=t.collisionBoxes;for(let n=0;n<i.length;n++){const a=i[n],r={x:d.x+a.x,y:d.y+a.y,w:a.w,h:a.h};for(let h=0;h<o.length;h++){const c=o[h],u={x:t.x+c.x,y:t.y+c.y,w:c.w,h:c.h};if(_(r,u))return!0}}return!1}function ot(d,t,e=6){if(Y(d,t))return!1;const s={x:d.x-e,y:d.y-e,w:d.w+e*2,h:d.h+e*2},i={x:t.x,y:t.y,w:t.w,h:t.h};return _(s,i)}class at{phase="READY";speed=F.SPEED;elapsedMs=0;crashTimerMs=0;introTimerMs=0;trex;horizon;scoreManager;dayNightManager;rng;currentEvents=[];constructor(t=1337,e=0){this.rng=new J(t),this.trex=new tt,this.horizon=new st(this.rng),this.scoreManager=new it(e),this.dayNightManager=new nt,this.reset(t)}reset(t){t!==void 0&&this.rng.setSeed(t),this.phase="READY",this.speed=F.SPEED,this.elapsedMs=0,this.crashTimerMs=0,this.introTimerMs=0,this.currentEvents=[],this.trex.reset(),this.horizon.reset(),this.scoreManager.reset(),this.dayNightManager.reset()}get state(){const t=this.scoreManager.score,e=Math.floor(t/F.INVERT_DISTANCE)%7;return{phase:this.phase,trex:this.trex.getState(),obstacles:this.horizon.getObstacleStates(),clouds:this.horizon.getCloudStates(),groundOffset:this.horizon.groundOffset,speed:this.speed,distance:this.scoreManager.distance,score:t,highScore:this.scoreManager.highScore,isNight:this.dayNightManager.isNight,nightFade:this.dayNightManager.nightFade,moonPhase:this.dayNightManager.moonPhase,isFlashing:this.scoreManager.isFlashing,flashIterations:this.scoreManager.flashIterations,elapsedMs:this.elapsedMs,biomeIndex:e,events:[...this.currentEvents]}}step(t,e=1){this.currentEvents=[];const s=e*(1e3/F.FPS);switch(this.elapsedMs+=s,this.phase){case"BOOT":case"READY":this.handleReadyPhase(t,e);break;case"INTRO":this.handleIntroPhase(t,e,s);break;case"RUNNING":this.handleRunningPhase(t,e,s);break;case"CRASHED":this.handleCrashedPhase(t,s);break}}handleReadyPhase(t,e){this.trex.updateAnim(e),t.jumpPressed&&(this.phase="INTRO",this.introTimerMs=0,this.currentEvents.push("jump"),this.trex.startJump(this.speed))}handleIntroPhase(t,e,s){this.introTimerMs+=s,this.trex.updateJump(e)&&this.currentEvents.push("land"),this.trex.updateAnim(e),this.horizon.update(this.speed,e),this.introTimerMs>=y.INTRO_DURATION&&(this.phase="RUNNING")}handleRunningPhase(t,e,s){t.duckHeld?this.trex.setDuck(!0):this.trex.setDuck(!1),t.jumpPressed?this.trex.startJump(this.speed)&&this.currentEvents.push("jump"):!t.jumpHeld&&this.trex.jumping&&this.trex.endJump(),this.trex.updateJump(e)&&this.currentEvents.push("land"),this.trex.updateAnim(e),this.horizon.update(this.speed,e);const o=this.trex.getState(),n=this.horizon.obstacles;for(let c=0;c<n.length;c++){const u=n[c].getState();if(Y(o,u)){this.phase="CRASHED",this.crashTimerMs=0,this.currentEvents.push("crash"),this.scoreManager.onCrash()&&this.currentEvents.push("highScore");return}ot(o,u,6)&&this.currentEvents.push("nearMiss")}this.speed<F.MAX_SPEED&&(this.speed=Math.min(F.MAX_SPEED,this.speed+F.ACCELERATION*e));const{milestoneAchieved:a,newHighScore:r}=this.scoreManager.update(this.speed,e,1e3/F.FPS);a&&this.currentEvents.push("milestone"),r&&this.currentEvents.push("highScore");const{biomeChanged:h}=this.dayNightManager.update(this.scoreManager.score,e,1e3/F.FPS);h&&this.currentEvents.push("biomeChange")}handleCrashedPhase(t,e){if(this.crashTimerMs+=e,this.crashTimerMs>=F.GAMEOVER_CLEAR_TIME&&(t.restartPressed||t.jumpPressed)){const s=this.scoreManager.highScore;this.reset(),this.scoreManager.setHighScore(s),this.phase="RUNNING"}}}class rt{logicalWidth=600;logicalHeight=150;aspectRatio=4/1;cssWidth=600;cssHeight=150;dpr=1;scale=1;canvas;onResizeCallbacks=[];constructor(t){this.canvas=t,this.updateDimensions(),window.addEventListener("resize",this.handleResize),window.addEventListener("orientationchange",this.handleResize)}handleResize=()=>{this.updateDimensions();for(const t of this.onResizeCallbacks)t()};onResize(t){this.onResizeCallbacks.push(t)}updateDimensions(){this.dpr=window.devicePixelRatio||1;const t=this.canvas.parentElement,e=t?t.clientWidth:window.innerWidth,s=t?t.clientHeight:window.innerHeight;let i=e,o=i/this.aspectRatio;o>s&&s>0&&(o=s,i=o*this.aspectRatio),this.cssWidth=i,this.cssHeight=o,this.scale=this.cssWidth/this.logicalWidth,this.canvas.width=Math.round(this.cssWidth*this.dpr),this.canvas.height=Math.round(this.cssHeight*this.dpr),this.canvas.style.width=`${this.cssWidth}px`,this.canvas.style.height=`${this.cssHeight}px`}applyTransform(t){t.setTransform(1,0,0,1,0,0),t.scale(this.scale*this.dpr,this.scale*this.dpr)}destroy(){window.removeEventListener("resize",this.handleResize),window.removeEventListener("orientationchange",this.handleResize)}}const lt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
  <defs>
    <linearGradient id="dinoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5A5A5A" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
    <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#808080" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Idle (44x47) -->
  <g>
    <!-- Tail (x: 1..14, y: 19..30) -->
    <path d="M1 21 Q 4 19, 12 21 Q 14 26, 12 30 Q 7 28, 1 21 Z" fill="url(#dinoGrad)" />
    <!-- Back & Torso -->
    <path d="M10 20 Q 14 18, 22 18 L 22 24 Q 28 24, 28 28 Q 28 34, 21 34 Q 13 34, 10 26 Z" fill="url(#dinoGrad)" />
    <!-- Belly highlight patch -->
    <path d="M14 22 Q 18 20, 22 22 Q 22 28, 20 31 Q 16 31, 14 26 Z" fill="url(#bellyGrad)" />
    <!-- Spinal Dorsal Ridges -->
    <polygon points="12,18 14,16 16,18" fill="#FF8C00" opacity="0.8" />
    <polygon points="17,17 19,15 21,17" fill="#FF8C00" opacity="0.8" />
    <!-- Neck & Head (x: 22..39, y: 0..16) -->
    <path d="M22 18 L 22 8 Q 22 2, 28 1 L 38 1 Q 41 1, 41 5 L 41 11 Q 41 14, 37 14 L 33 14 L 33 16 L 27 16 L 26 21 Z" fill="url(#dinoGrad)" />
    <!-- Snout & Jaw line -->
    <path d="M29 11 L 39 11" stroke="#222" stroke-width="1.2" stroke-linecap="round" />
    <!-- Eye with Specular Glint -->
    <circle cx="28" cy="5" r="2.5" fill="#FFFFFF" />
    <circle cx="28.5" cy="5" r="1.5" fill="#1A1A1A" />
    <circle cx="29" cy="4.2" r="0.6" fill="#FFFFFF" />
    <!-- Cheek Blush -->
    <ellipse cx="27" cy="8.5" rx="1.5" ry="1" fill="#FF6B6B" opacity="0.4" />
    <!-- Cute Arm with Claws -->
    <path d="M28 22 Q 33 22, 33 24 L 31 26 Q 28 25, 27 23 Z" fill="#404040" />
    <circle cx="33" cy="24.5" r="0.8" fill="#FFF" opacity="0.7" />
    <!-- Legs & Paws (standing) -->
    <!-- Left Leg -->
    <path d="M13 33 Q 16 33, 16 38 L 16 43 L 19 43 L 19 45 L 12 45 L 12 38 Q 12 34, 13 33 Z" fill="#3D3D3D" />
    <!-- Right Leg -->
    <path d="M20 33 Q 23 33, 23 38 L 23 43 L 26 43 L 26 45 L 19 45 L 19 38 Q 19 34, 20 33 Z" fill="#484848" />
    <!-- Claws -->
    <circle cx="18.5" cy="44.5" r="0.6" fill="#FFF" opacity="0.6" />
    <circle cx="25.5" cy="44.5" r="0.6" fill="#FFF" opacity="0.6" />
  </g>
</svg>
`,ht=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
  <defs>
    <linearGradient id="dinoRun1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5A5A5A" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
    <linearGradient id="bellyRun1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#808080" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Run 1 (44x47) -->
  <g>
    <!-- Tail (dynamic upward angle) -->
    <path d="M1 19 Q 4 17, 12 20 Q 14 25, 12 29 Q 7 26, 1 19 Z" fill="url(#dinoRun1Grad)" />
    <!-- Back & Torso -->
    <path d="M10 20 Q 14 18, 22 18 L 22 24 Q 28 24, 28 28 Q 28 34, 21 34 Q 13 34, 10 26 Z" fill="url(#dinoRun1Grad)" />
    <!-- Belly patch -->
    <path d="M14 22 Q 18 20, 22 22 Q 22 28, 20 31 Q 16 31, 14 26 Z" fill="url(#bellyRun1Grad)" />
    <!-- Spinal Ridges -->
    <polygon points="12,17 14,15 16,17" fill="#FF8C00" opacity="0.8" />
    <polygon points="17,16 19,14 21,16" fill="#FF8C00" opacity="0.8" />
    <!-- Neck & Head -->
    <path d="M22 18 L 22 8 Q 22 2, 28 1 L 38 1 Q 41 1, 41 5 L 41 11 Q 41 14, 37 14 L 33 14 L 33 16 L 27 16 L 26 21 Z" fill="url(#dinoRun1Grad)" />
    <!-- Mouth -->
    <path d="M29 11 L 39 11" stroke="#222" stroke-width="1.2" stroke-linecap="round" />
    <!-- Eye focused on road -->
    <circle cx="28.5" cy="5" r="2.5" fill="#FFFFFF" />
    <circle cx="29.2" cy="5" r="1.5" fill="#1A1A1A" />
    <circle cx="29.7" cy="4.2" r="0.6" fill="#FFFFFF" />
    <!-- Cheek Blush -->
    <ellipse cx="27" cy="8.5" rx="1.5" ry="1" fill="#FF6B6B" opacity="0.4" />
    <!-- Arm swinging -->
    <path d="M28 21 Q 34 20, 33 23 L 31 25 Q 28 24, 27 22 Z" fill="#404040" />
    <circle cx="33.5" cy="23.5" r="0.8" fill="#FFF" opacity="0.7" />
    <!-- Run Stride 1: Back Leg Trailing, Forward Leg Stepping -->
    <!-- Back Leg (tucked back) -->
    <path d="M11 33 Q 15 33, 14 38 L 11 41 L 13 41 L 13 42 L 8 42 L 9 39 Q 10 34, 11 33 Z" fill="#3A3A3A" />
    <!-- Forward Leg (reaching ahead) -->
    <path d="M19 33 Q 23 33, 23 38 L 24 43 L 27 43 L 27 45 L 20 45 L 20 41 Q 19 36, 19 33 Z" fill="#484848" />
    <circle cx="26.5" cy="44.5" r="0.6" fill="#FFF" opacity="0.6" />
  </g>
</svg>
`,ct=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
  <defs>
    <linearGradient id="dinoRun2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5A5A5A" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
    <linearGradient id="bellyRun2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#808080" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Run 2 (44x47) -->
  <g>
    <!-- Tail (dynamic upward angle) -->
    <path d="M1 20 Q 4 18, 12 21 Q 14 26, 12 30 Q 7 27, 1 20 Z" fill="url(#dinoRun2Grad)" />
    <!-- Back & Torso -->
    <path d="M10 20 Q 14 18, 22 18 L 22 24 Q 28 24, 28 28 Q 28 34, 21 34 Q 13 34, 10 26 Z" fill="url(#dinoRun2Grad)" />
    <!-- Belly patch -->
    <path d="M14 22 Q 18 20, 22 22 Q 22 28, 20 31 Q 16 31, 14 26 Z" fill="url(#bellyRun2Grad)" />
    <!-- Spinal Ridges -->
    <polygon points="12,17 14,15 16,17" fill="#FF8C00" opacity="0.8" />
    <polygon points="17,16 19,14 21,16" fill="#FF8C00" opacity="0.8" />
    <!-- Neck & Head -->
    <path d="M22 18 L 22 8 Q 22 2, 28 1 L 38 1 Q 41 1, 41 5 L 41 11 Q 41 14, 37 14 L 33 14 L 33 16 L 27 16 L 26 21 Z" fill="url(#dinoRun2Grad)" />
    <!-- Mouth -->
    <path d="M29 11 L 39 11" stroke="#222" stroke-width="1.2" stroke-linecap="round" />
    <!-- Eye focused on road -->
    <circle cx="28.5" cy="5" r="2.5" fill="#FFFFFF" />
    <circle cx="29.2" cy="5" r="1.5" fill="#1A1A1A" />
    <circle cx="29.7" cy="4.2" r="0.6" fill="#FFFFFF" />
    <!-- Cheek Blush -->
    <ellipse cx="27" cy="8.5" rx="1.5" ry="1" fill="#FF6B6B" opacity="0.4" />
    <!-- Arm swinging -->
    <path d="M28 22 Q 33 23, 32 25 L 30 26 Q 28 25, 27 23 Z" fill="#404040" />
    <circle cx="32.5" cy="25.5" r="0.8" fill="#FFF" opacity="0.7" />
    <!-- Run Stride 2: Legs Inverted -->
    <!-- Front Leg Stepping Forward -->
    <path d="M13 33 Q 17 33, 17 38 L 18 43 L 21 43 L 21 45 L 14 45 L 14 41 Q 13 36, 13 33 Z" fill="#484848" />
    <circle cx="20.5" cy="44.5" r="0.6" fill="#FFF" opacity="0.6" />
    <!-- Back Leg Trailing -->
    <path d="M21 33 Q 24 33, 23 38 L 20 41 L 22 41 L 22 42 L 17 42 L 18 39 Q 20 34, 21 33 Z" fill="#3A3A3A" />
  </g>
</svg>
`,dt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 25" width="59" height="25">
  <defs>
    <linearGradient id="duckGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4A4A4A" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Duck 1 (59x25) -->
  <g>
    <!-- Tail (lowered streamlined, x:1..16) -->
    <path d="M1 9 Q 6 6, 16 7 Q 16 14, 12 16 Q 6 15, 1 9 Z" fill="url(#duckGrad1)" />
    <!-- Horizontal Streamlined Body -->
    <path d="M14 7 Q 26 5, 38 6 L 38 9 Q 44 9, 56 9 Q 58 9, 58 13 L 58 17 Q 58 19, 55 19 L 42 19 L 36 21 L 24 21 Q 16 21, 14 14 Z" fill="url(#duckGrad1)" />
    <!-- Belly streamline highlight -->
    <path d="M22 10 Q 34 8, 44 10 Q 44 16, 36 17 Q 24 17, 22 14 Z" fill="#FFFFFF" opacity="0.15" />
    <!-- Dorsal ridge -->
    <polygon points="20,6 22,4 24,6" fill="#FF8C00" opacity="0.8" />
    <polygon points="26,5 28,3 30,5" fill="#FF8C00" opacity="0.8" />
    <!-- Goggles Strap / Eye -->
    <rect x="42" y="7" width="12" height="2" fill="#222" opacity="0.5" />
    <!-- Focused Eye with spec glint -->
    <circle cx="47" cy="11" r="2.2" fill="#FFFFFF" />
    <circle cx="47.6" cy="11" r="1.3" fill="#1A1A1A" />
    <circle cx="48" cy="10.3" r="0.5" fill="#FFFFFF" />
    <!-- Snout line -->
    <path d="M49 16 L 57 16" stroke="#222" stroke-width="1" stroke-linecap="round" />
    <!-- Arm tucked back -->
    <path d="M36 14 Q 41 14, 40 16 L 37 17 Z" fill="#3D3D3D" />
    <!-- Duck Run Legs: Left forward, Right back -->
    <path d="M22 17 Q 26 17, 26 21 L 29 21 L 29 23 L 22 23 Z" fill="#444" />
    <path d="M32 17 Q 35 17, 34 20 L 31 22 L 33 22 L 30 23 Z" fill="#383838" />
  </g>
</svg>
`,ut=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 25" width="59" height="25">
  <defs>
    <linearGradient id="duckGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4A4A4A" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Duck 2 (59x25) -->
  <g>
    <!-- Tail (lowered streamlined) -->
    <path d="M1 9 Q 6 6, 16 7 Q 16 14, 12 16 Q 6 15, 1 9 Z" fill="url(#duckGrad2)" />
    <!-- Horizontal Streamlined Body -->
    <path d="M14 7 Q 26 5, 38 6 L 38 9 Q 44 9, 56 9 Q 58 9, 58 13 L 58 17 Q 58 19, 55 19 L 42 19 L 36 21 L 24 21 Q 16 21, 14 14 Z" fill="url(#duckGrad2)" />
    <!-- Belly streamline highlight -->
    <path d="M22 10 Q 34 8, 44 10 Q 44 16, 36 17 Q 24 17, 22 14 Z" fill="#FFFFFF" opacity="0.15" />
    <!-- Dorsal ridge -->
    <polygon points="20,6 22,4 24,6" fill="#FF8C00" opacity="0.8" />
    <polygon points="26,5 28,3 30,5" fill="#FF8C00" opacity="0.8" />
    <!-- Goggles Strap / Eye -->
    <rect x="42" y="7" width="12" height="2" fill="#222" opacity="0.5" />
    <!-- Focused Eye with spec glint -->
    <circle cx="47" cy="11" r="2.2" fill="#FFFFFF" />
    <circle cx="47.6" cy="11" r="1.3" fill="#1A1A1A" />
    <circle cx="48" cy="10.3" r="0.5" fill="#FFFFFF" />
    <!-- Snout line -->
    <path d="M49 16 L 57 16" stroke="#222" stroke-width="1" stroke-linecap="round" />
    <!-- Arm tucked back -->
    <path d="M36 14 Q 41 14, 40 16 L 37 17 Z" fill="#3D3D3D" />
    <!-- Duck Run Legs: Inverted stride -->
    <path d="M22 17 Q 25 17, 24 20 L 21 22 L 23 22 L 20 23 Z" fill="#383838" />
    <path d="M30 17 Q 34 17, 34 21 L 37 21 L 37 23 L 30 23 Z" fill="#444" />
  </g>
</svg>
`,pt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
  <defs>
    <linearGradient id="dinoDeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#555555" />
      <stop offset="100%" stop-color="#333333" />
    </linearGradient>
  </defs>
  <!-- Trex Modern Vector Dead (44x47) -->
  <g>
    <!-- Tail drooped -->
    <path d="M1 23 Q 4 22, 12 24 Q 14 28, 12 32 Q 7 30, 1 23 Z" fill="url(#dinoDeadGrad)" />
    <!-- Back & Torso -->
    <path d="M10 21 Q 14 19, 22 19 L 22 24 Q 28 24, 28 28 Q 28 34, 21 34 Q 13 34, 10 27 Z" fill="url(#dinoDeadGrad)" />
    <!-- Spinal Ridges -->
    <polygon points="12,18 14,16 16,18" fill="#FF8C00" opacity="0.6" />
    <polygon points="17,17 19,15 21,17" fill="#FF8C00" opacity="0.6" />
    <!-- Head tilted slightly -->
    <path d="M22 19 L 22 8 Q 22 2, 28 1 L 38 1 Q 41 1, 41 5 L 41 11 Q 41 14, 37 14 L 33 14 L 33 16 L 27 16 L 26 21 Z" fill="url(#dinoDeadGrad)" />
    <!-- Shocked Open Mouth -->
    <path d="M31 11 Q 36 9, 39 12 Q 36 15, 31 13 Z" fill="#1A1A1A" />
    <!-- Cute pink tongue sticking out -->
    <path d="M34 13 Q 36 16, 38 15 Q 39 13, 36 12 Z" fill="#FF6B8B" />
    <!-- Cartoon X Eye -->
    <line x1="26" y1="3" x2="31" y2="8" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
    <line x1="31" y1="3" x2="26" y2="8" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
    <!-- Dizzy little stars floating above head -->
    <polygon points="26,0 27,2 29,2 27,3 28,5 26,4 24,5 25,3 23,2 25,2" fill="#FFD700" opacity="0.9" />
    <!-- Limp Arm -->
    <path d="M27 22 Q 30 26, 29 27 L 27 26 Z" fill="#3D3D3D" />
    <!-- Fallen Paws -->
    <path d="M12 34 Q 15 34, 15 39 L 18 41 L 18 43 L 11 43 L 11 38 Z" fill="#383838" />
    <path d="M19 34 Q 22 34, 22 39 L 25 41 L 25 43 L 18 43 L 18 38 Z" fill="#444444" />
  </g>
</svg>
`,ft=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <defs>
    <linearGradient id="cactusSmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#3D6342" />
      <stop offset="100%" stop-color="#2C4B30" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Small Cactus (17x35) -->
  <g>
    <!-- Main Stem (x: 4..10, y: 0..34) -->
    <rect x="4.5" y="1" width="5.5" height="34" rx="2.7" fill="url(#cactusSmGrad)" />
    <!-- Left Arm (x: 0..5, y: 7..24) -->
    <path d="M 1 10 Q 1 7, 3.5 7 Q 4.5 7, 4.5 10 L 4.5 19 Q 4.5 22, 6 22 L 6 25 Q 3.5 25, 2.5 23 Q 1 20, 1 16 Z" fill="url(#cactusSmGrad)" />
    <!-- Right Arm (x: 9..16, y: 4..18) -->
    <path d="M 15.5 8 Q 15.5 5, 13.5 5 Q 12 5, 12 8 L 12 14 Q 12 17, 10 17 L 10 20 Q 13 20, 14 18 Q 15.5 16, 15.5 12 Z" fill="url(#cactusSmGrad)" />
    <!-- Vertical Rib Texture Highlight -->
    <line x1="6.5" y1="3" x2="6.5" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <!-- Beautiful Desert Flower on Top -->
    <circle cx="7.2" cy="1.2" r="1.8" fill="#FF2A7A" />
    <circle cx="7.2" cy="1.2" r="0.7" fill="#FFD700" />
  </g>
</svg>
`,gt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 35" width="34" height="35">
  <defs>
    <linearGradient id="cactusSmGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#3D6342" />
      <stop offset="100%" stop-color="#2C4B30" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Small Cactus 2-Cluster (34x35) -->
  <g>
    <!-- Cactus 1 -->
    <rect x="4.5" y="1" width="5.5" height="34" rx="2.7" fill="url(#cactusSmGrad2)" />
    <path d="M 1 10 Q 1 7, 3.5 7 Q 4.5 7, 4.5 10 L 4.5 19 Q 4.5 22, 6 22 L 6 25 Q 3.5 25, 2.5 23 Q 1 20, 1 16 Z" fill="url(#cactusSmGrad2)" />
    <path d="M 14.5 8 Q 14.5 5, 12.5 5 Q 11 5, 11 8 L 11 14 Q 11 17, 9 17 L 9 20 Q 12 20, 13 18 Q 14.5 16, 14.5 12 Z" fill="url(#cactusSmGrad2)" />
    <line x1="6.5" y1="3" x2="6.5" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <circle cx="7.2" cy="1.2" r="1.8" fill="#FF2A7A" />
    <circle cx="7.2" cy="1.2" r="0.7" fill="#FFD700" />

    <!-- Cactus 2 (slightly offset height for organic variety) -->
    <rect x="21" y="3" width="5.5" height="32" rx="2.7" fill="url(#cactusSmGrad2)" />
    <path d="M 17.5 11 Q 17.5 8, 19.5 8 Q 20.5 8, 20.5 11 L 20.5 19 Q 20.5 22, 22 22 L 22 24.5 Q 19.5 24.5, 18.5 22.5 Q 17.5 20, 17.5 16 Z" fill="url(#cactusSmGrad2)" />
    <path d="M 31 10 Q 31 7, 29 7 Q 27.5 7, 27.5 10 L 27.5 15 Q 27.5 18, 26 18 L 26 21 Q 29 21, 30 19 Q 31 17, 31 13 Z" fill="url(#cactusSmGrad2)" />
    <line x1="23.2" y1="5" x2="23.2" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <circle cx="23.7" cy="3.2" r="1.8" fill="#FF9F1C" />
    <circle cx="23.7" cy="3.2" r="0.7" fill="#FFF" />
  </g>
</svg>
`,mt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 35" width="51" height="35">
  <defs>
    <linearGradient id="cactusSmGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#3D6342" />
      <stop offset="100%" stop-color="#2C4B30" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Small Cactus 3-Cluster (51x35) -->
  <g>
    <!-- Unit 1 -->
    <rect x="4.5" y="1" width="5.5" height="34" rx="2.7" fill="url(#cactusSmGrad3)" />
    <path d="M 1 10 Q 1 7, 3.5 7 Q 4.5 7, 4.5 10 L 4.5 19 Q 4.5 22, 6 22 L 6 25 Q 3.5 25, 2.5 23 Q 1 20, 1 16 Z" fill="url(#cactusSmGrad3)" />
    <path d="M 14.5 8 Q 14.5 5, 12.5 5 Q 11 5, 11 8 L 11 14 Q 11 17, 9 17 L 9 20 Q 12 20, 13 18 Q 14.5 16, 14.5 12 Z" fill="url(#cactusSmGrad3)" />
    <line x1="6.5" y1="3" x2="6.5" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <circle cx="7.2" cy="1.2" r="1.8" fill="#FF2A7A" />
    <circle cx="7.2" cy="1.2" r="0.7" fill="#FFD700" />

    <!-- Unit 2 -->
    <rect x="21" y="3" width="5.5" height="32" rx="2.7" fill="url(#cactusSmGrad3)" />
    <path d="M 17.5 11 Q 17.5 8, 19.5 8 Q 20.5 8, 20.5 11 L 20.5 19 Q 20.5 22, 22 22 L 22 24.5 Q 19.5 24.5, 18.5 22.5 Q 17.5 20, 17.5 16 Z" fill="url(#cactusSmGrad3)" />
    <path d="M 31 10 Q 31 7, 29 7 Q 27.5 7, 27.5 10 L 27.5 15 Q 27.5 18, 26 18 L 26 21 Q 29 21, 30 19 Q 31 17, 31 13 Z" fill="url(#cactusSmGrad3)" />
    <line x1="23.2" y1="5" x2="23.2" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <circle cx="23.7" cy="3.2" r="1.8" fill="#FF9F1C" />
    <circle cx="23.7" cy="3.2" r="0.7" fill="#FFF" />

    <!-- Unit 3 -->
    <rect x="38" y="2" width="5.5" height="33" rx="2.7" fill="url(#cactusSmGrad3)" />
    <path d="M 34.5 9 Q 34.5 6, 36.5 6 Q 37.5 6, 37.5 9 L 37.5 17 Q 37.5 20, 39 20 L 39 23 Q 36.5 23, 35.5 21 Q 34.5 18, 34.5 14 Z" fill="url(#cactusSmGrad3)" />
    <path d="M 48 9 Q 48 6, 46 6 Q 44.5 6, 44.5 9 L 44.5 15 Q 44.5 18, 43 18 L 43 21 Q 46 21, 47 19 Q 48 17, 48 13 Z" fill="url(#cactusSmGrad3)" />
    <line x1="40.2" y1="4" x2="40.2" y2="33" stroke="#88B88E" stroke-width="0.8" opacity="0.6" stroke-linecap="round" />
    <circle cx="40.7" cy="2.2" r="1.8" fill="#FF2A7A" />
    <circle cx="40.7" cy="2.2" r="0.7" fill="#FFD700" />
  </g>
</svg>
`,yt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <defs>
    <linearGradient id="cactusLgGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#385C3D" />
      <stop offset="100%" stop-color="#254229" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Large Saguaro (25x50) -->
  <g>
    <!-- Main Trunk (x: 8..15, y: 0..50) -->
    <rect x="8.5" y="2" width="7" height="48" rx="3.5" fill="url(#cactusLgGrad1)" />
    <!-- Left Branch (x: 0..7, y: 12..38) -->
    <path d="M 1.5 15 Q 1.5 12, 4.5 12 Q 7 12, 7 15 L 7 28 Q 7 32, 9.5 32 L 9.5 37 Q 5.5 37, 4 35 Q 1.5 31, 1.5 25 Z" fill="url(#cactusLgGrad1)" />
    <!-- Right Branch (x: 15..24, y: 10..32) -->
    <path d="M 23.5 14 Q 23.5 11, 20.5 11 Q 18 11, 18 14 L 18 22 Q 18 26, 15 26 L 15 31 Q 19 31, 21 29 Q 23.5 26, 23.5 20 Z" fill="url(#cactusLgGrad1)" />
    <!-- Vertical Rib Texture Highlights -->
    <line x1="11" y1="4" x2="11" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <line x1="13" y1="4" x2="13" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.3" stroke-linecap="round" />
    <line x1="4" y1="14" x2="4" y2="28" stroke="#88B88E" stroke-width="0.7" opacity="0.5" stroke-linecap="round" />
    <line x1="21" y1="13" x2="21" y2="22" stroke="#88B88E" stroke-width="0.7" opacity="0.5" stroke-linecap="round" />
    <!-- Desert Flower Crown -->
    <circle cx="12" cy="2" r="2.2" fill="#FF2A7A" />
    <circle cx="12" cy="2" r="0.9" fill="#FFD700" />
    <circle cx="4.5" cy="12" r="1.4" fill="#FF2A7A" opacity="0.8" />
  </g>
</svg>
`,Ft=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
  <defs>
    <linearGradient id="cactusLgGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#385C3D" />
      <stop offset="100%" stop-color="#254229" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Large Saguaro 2-Cluster (50x50) -->
  <g>
    <!-- Unit 1 -->
    <rect x="8.5" y="2" width="7" height="48" rx="3.5" fill="url(#cactusLgGrad2)" />
    <path d="M 1.5 15 Q 1.5 12, 4.5 12 Q 7 12, 7 15 L 7 28 Q 7 32, 9.5 32 L 9.5 37 Q 5.5 37, 4 35 Q 1.5 31, 1.5 25 Z" fill="url(#cactusLgGrad2)" />
    <path d="M 23.5 14 Q 23.5 11, 20.5 11 Q 18 11, 18 14 L 18 22 Q 18 26, 15 26 L 15 31 Q 19 31, 21 29 Q 23.5 26, 23.5 20 Z" fill="url(#cactusLgGrad2)" />
    <line x1="11" y1="4" x2="11" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <circle cx="12" cy="2" r="2.2" fill="#FF2A7A" />
    <circle cx="12" cy="2" r="0.9" fill="#FFD700" />

    <!-- Unit 2 -->
    <rect x="33.5" y="4" width="7" height="46" rx="3.5" fill="url(#cactusLgGrad2)" />
    <path d="M 26.5 17 Q 26.5 14, 29.5 14 Q 32 14, 32 17 L 32 29 Q 32 33, 34.5 33 L 34.5 38 Q 30.5 38, 29 36 Q 26.5 32, 26.5 26 Z" fill="url(#cactusLgGrad2)" />
    <path d="M 48.5 15 Q 48.5 12, 45.5 12 Q 43 12, 43 15 L 43 23 Q 43 27, 40 27 L 40 32 Q 44 32, 46 30 Q 48.5 27, 48.5 21 Z" fill="url(#cactusLgGrad2)" />
    <line x1="36" y1="6" x2="36" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <circle cx="37" cy="4" r="2.2" fill="#FF9F1C" />
    <circle cx="37" cy="4" r="0.9" fill="#FFF" />
  </g>
</svg>
`,wt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 50" width="75" height="50">
  <defs>
    <linearGradient id="cactusLgGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4F7A54" />
      <stop offset="50%" stop-color="#385C3D" />
      <stop offset="100%" stop-color="#254229" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Large Saguaro 3-Cluster (75x50) -->
  <g>
    <!-- Unit 1 -->
    <rect x="8.5" y="2" width="7" height="48" rx="3.5" fill="url(#cactusLgGrad3)" />
    <path d="M 1.5 15 Q 1.5 12, 4.5 12 Q 7 12, 7 15 L 7 28 Q 7 32, 9.5 32 L 9.5 37 Q 5.5 37, 4 35 Q 1.5 31, 1.5 25 Z" fill="url(#cactusLgGrad3)" />
    <path d="M 23.5 14 Q 23.5 11, 20.5 11 Q 18 11, 18 14 L 18 22 Q 18 26, 15 26 L 15 31 Q 19 31, 21 29 Q 23.5 26, 23.5 20 Z" fill="url(#cactusLgGrad3)" />
    <line x1="11" y1="4" x2="11" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <circle cx="12" cy="2" r="2.2" fill="#FF2A7A" />

    <!-- Unit 2 -->
    <rect x="33.5" y="4" width="7" height="46" rx="3.5" fill="url(#cactusLgGrad3)" />
    <path d="M 26.5 17 Q 26.5 14, 29.5 14 Q 32 14, 32 17 L 32 29 Q 32 33, 34.5 33 L 34.5 38 Q 30.5 38, 29 36 Q 26.5 32, 26.5 26 Z" fill="url(#cactusLgGrad3)" />
    <path d="M 48.5 15 Q 48.5 12, 45.5 12 Q 43 12, 43 15 L 43 23 Q 43 27, 40 27 L 40 32 Q 44 32, 46 30 Q 48.5 27, 48.5 21 Z" fill="url(#cactusLgGrad3)" />
    <line x1="36" y1="6" x2="36" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <circle cx="37" cy="4" r="2.2" fill="#FF9F1C" />

    <!-- Unit 3 -->
    <rect x="58.5" y="3" width="7" height="47" rx="3.5" fill="url(#cactusLgGrad3)" />
    <path d="M 51.5 16 Q 51.5 13, 54.5 13 Q 57 13, 57 16 L 57 28 Q 57 32, 59.5 32 L 59.5 37 Q 55.5 37, 54 35 Q 51.5 31, 51.5 25 Z" fill="url(#cactusLgGrad3)" />
    <path d="M 73.5 14 Q 73.5 11, 70.5 11 Q 68 11, 68 14 L 68 22 Q 68 26, 65 26 L 65 31 Q 69 31, 71 29 Q 73.5 26, 73.5 20 Z" fill="url(#cactusLgGrad3)" />
    <line x1="61" y1="5" x2="61" y2="48" stroke="#88B88E" stroke-width="0.9" opacity="0.6" stroke-linecap="round" />
    <circle cx="62" cy="3" r="2.2" fill="#FF2A7A" />
  </g>
</svg>
`,Mt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40" width="46" height="40">
  <defs>
    <linearGradient id="pteroWingGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4A6572" />
      <stop offset="100%" stop-color="#344955" />
    </linearGradient>
    <linearGradient id="pteroBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#232F34" />
      <stop offset="100%" stop-color="#344955" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Pterodactyl Wing UP (46x40) -->
  <g>
    <!-- Long Aerodynamic Beak & Crest (x: 2..16, y: 8..17) -->
    <!-- Sharp Beak -->
    <path d="M 2 15 Q 8 13, 14 13 L 14 17 Q 8 16, 2 15 Z" fill="#F9AA33" />
    <!-- Head & Sharp Rear Crest -->
    <path d="M 12 12 Q 10 7, 7 8 Q 11 10, 14 11 L 18 11 Q 20 13, 18 17 L 13 17 Z" fill="url(#pteroBodyGrad)" />
    <!-- Glowing Eye -->
    <circle cx="12" cy="12.5" r="1.5" fill="#FFFFFF" />
    <circle cx="12.2" cy="12.5" r="0.8" fill="#111111" />
    <!-- Torso & Streamlined Tail (x: 16..42, y: 15..26) -->
    <path d="M 16 14 Q 24 14, 32 17 Q 42 21, 42 22 Q 42 23, 30 23 Q 22 23, 18 19 Z" fill="url(#pteroBodyGrad)" />
    <!-- Wing Flapping UP (x: 14..36, y: 1..16) -->
    <path d="M 18 15 Q 16 2, 22 1 Q 28 4, 34 8 Q 36 12, 34 16 Q 26 14, 18 15 Z" fill="url(#pteroWingGrad1)" />
    <!-- Wing membrane bone ribs -->
    <path d="M 21 2 Q 24 8, 27 15" stroke="#F9AA33" stroke-width="0.8" fill="none" opacity="0.7" />
    <path d="M 27 5 Q 30 10, 32 15" stroke="#F9AA33" stroke-width="0.8" fill="none" opacity="0.7" />
  </g>
</svg>
`,xt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40" width="46" height="40">
  <defs>
    <linearGradient id="pteroWingGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#344955" />
      <stop offset="100%" stop-color="#4A6572" />
    </linearGradient>
    <linearGradient id="pteroBodyGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#232F34" />
      <stop offset="100%" stop-color="#344955" />
    </linearGradient>
  </defs>
  <!-- Modern Vector Pterodactyl Wing DOWN (46x40) -->
  <g>
    <!-- Long Aerodynamic Beak & Crest -->
    <path d="M 2 15 Q 8 13, 14 13 L 14 17 Q 8 16, 2 15 Z" fill="#F9AA33" />
    <path d="M 12 12 Q 10 7, 7 8 Q 11 10, 14 11 L 18 11 Q 20 13, 18 17 L 13 17 Z" fill="url(#pteroBodyGrad2)" />
    <circle cx="12" cy="12.5" r="1.5" fill="#FFFFFF" />
    <circle cx="12.2" cy="12.5" r="0.8" fill="#111111" />
    <!-- Torso & Streamlined Tail -->
    <path d="M 16 14 Q 24 14, 32 17 Q 42 21, 42 22 Q 42 23, 30 23 Q 22 23, 18 19 Z" fill="url(#pteroBodyGrad2)" />
    <!-- Wing Flapping DOWN (x: 16..36, y: 18..38) -->
    <path d="M 18 18 Q 18 36, 24 37 Q 29 34, 34 29 Q 36 24, 30 20 Q 24 18, 18 18 Z" fill="url(#pteroWingGrad2)" />
    <!-- Wing membrane bone ribs -->
    <path d="M 23 37 Q 24 28, 26 19" stroke="#F9AA33" stroke-width="0.8" fill="none" opacity="0.7" />
    <path d="M 29 33 Q 29 25, 29 19" stroke="#F9AA33" stroke-width="0.8" fill="none" opacity="0.7" />
  </g>
</svg>
`,bt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 14" width="46" height="14">
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#E2E8F0" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="cloudUnder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#64748B" stop-opacity="0.5" />
    </linearGradient>
  </defs>
  <!-- Underside shadow puff -->
  <path d="M 6 12 C 4 12 1 12 1 10 C 1 8 4 7 7 8 C 9 5 15 4 19 6 C 22 3 31 3 35 6 C 39 4 44 6 45 9 C 46 11 43 13 39 13 Z" fill="url(#cloudUnder)" />
  <!-- Main cloud body -->
  <path d="M 6 11 C 3 11 1 9.5 1 8 C 1 6.5 3.5 5.5 6.5 6 C 8 3.5 13.5 2.5 17.5 4.5 C 20.5 1.5 29 1.5 33 4.5 C 37 2.5 42 4.5 43.5 7 C 45.5 8.5 44 11 40 11 Z" fill="url(#cloudGrad)" />
  <!-- Upper highlight puffs -->
  <ellipse cx="25" cy="4" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.6" />
  <ellipse cx="14" cy="5.5" rx="4.5" ry="2" fill="#FFFFFF" opacity="0.5" />
</svg>
`,vt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow0" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </radialGradient>
  </defs>
  <!-- Full Moon: 40x40 complete circle -->
  <circle cx="20" cy="20" r="18" fill="url(#moonGlow0)" />
  <!-- Maria / Crater soft accents -->
  <circle cx="14" cy="15" r="3.5" fill="#94A3B8" opacity="0.25" />
  <circle cx="23" cy="13" r="2.2" fill="#94A3B8" opacity="0.2" />
  <circle cx="25" cy="24" r="4.2" fill="#94A3B8" opacity="0.25" />
  <circle cx="15" cy="27" r="2.8" fill="#94A3B8" opacity="0.2" />
</svg>
`,Tt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow1" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </radialGradient>
  </defs>
  <!-- Faint dark side orb -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.4" />
  <!-- Illuminated Gibbous -->
  <path d="M 20 2 A 18 18 0 0 1 20 38 C 10 38 7 29 7 20 C 7 11 10 2 20 2 Z" fill="url(#moonGlow1)" />
  <circle cx="24" cy="18" r="3" fill="#94A3B8" opacity="0.25" />
</svg>
`,St=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow2" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </radialGradient>
  </defs>
  <!-- Faint dark side -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.4" />
  <!-- Illuminated half -->
  <path d="M 20 2 A 18 18 0 0 1 20 38 Z" fill="url(#moonGlow2)" />
  <circle cx="26" cy="19" r="2.8" fill="#94A3B8" opacity="0.22" />
</svg>
`,At=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow3" cx="60%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="80%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </radialGradient>
  </defs>
  <!-- Faint dark side -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.35" />
  <!-- Crescent arc -->
  <path d="M 20 2 A 18 18 0 0 1 20 38 C 28 32 30 25 30 20 C 30 15 28 8 20 2 Z" fill="url(#moonGlow3)" />
</svg>
`,Et=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow4" cx="70%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="80%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </radialGradient>
  </defs>
  <!-- Faint dark side -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.3" />
  <!-- Crisp thin crescent -->
  <path d="M 20 2 A 18 18 0 0 1 20 38 C 24 33 26 26 26 20 C 26 14 24 7 20 2 Z" fill="url(#moonGlow4)" />
</svg>
`,kt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow5" cx="30%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </radialGradient>
  </defs>
  <!-- Faint dark side -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.4" />
  <!-- Illuminated left half -->
  <path d="M 20 2 A 18 18 0 0 0 20 38 Z" fill="url(#moonGlow5)" />
  <circle cx="14" cy="19" r="2.8" fill="#94A3B8" opacity="0.22" />
</svg>
`,Ct=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <radialGradient id="moonGlow6" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </radialGradient>
  </defs>
  <!-- Faint dark side -->
  <circle cx="20" cy="20" r="18" fill="#1E293B" opacity="0.4" />
  <!-- Illuminated waning gibbous -->
  <path d="M 20 2 A 18 18 0 0 0 20 38 C 30 38 33 29 33 20 C 33 11 30 2 20 2 Z" fill="url(#moonGlow6)" />
  <circle cx="16" cy="18" r="3" fill="#94A3B8" opacity="0.25" />
</svg>
`,Lt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="9" height="9">
  <!-- Modern 4-point twinkle star -->
  <path d="M 4.5 0 Q 4.5 4.5 0 4.5 Q 4.5 4.5 4.5 9 Q 4.5 4.5 9 4.5 Q 4.5 4.5 4.5 0 Z" fill="#FFFFFF" opacity="0.9" />
  <circle cx="4.5" cy="4.5" r="1.2" fill="#FFFFFF" />
</svg>
`,Dt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" width="36" height="32">
  <defs>
    <linearGradient id="restartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <filter id="restartGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#0284C7" flood-opacity="0.4" />
    </filter>
  </defs>
  <g filter="url(#restartGlow)">
    <!-- Base curved arrow -->
    <path d="M18 4a12 12 0 1 0 12 12h-4a8 8 0 1 1-8-8c2.2 0 4.2.9 5.7 2.3L20 14h12V2l-4.5 4.5A15.9 15.9 0 0 0 18 4z" fill="url(#restartGrad)" />
    <!-- Glossy inner rim highlight -->
    <path d="M18 6a10 10 0 0 0-10 10h2a8 8 0 0 1 8-8c2 0 3.8.7 5.2 2L20 13h9V4l-3.3 3.3A13.9 13.9 0 0 0 18 6z" fill="#FFFFFF" opacity="0.3" />
  </g>
</svg>
`,Bt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Canyon Small Cactus with Top Flower: 17x35 -->
  <g fill="currentColor">
    <path d="M5 4h4v31H5V4z" />
    <path d="M1 11h3v12H1V11z M1 23h4v3H1z" />
    <path d="M9 16h5v3H9z M13 8h3v10h-3V8z" />
    <!-- Flower Bud on top -->
    <circle cx="7" cy="2" r="2.5" fill="#FF4500" />
    <circle cx="7" cy="2" r="1" fill="#FFD700" />
  </g>
</svg>
`,Rt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <!-- Canyon Large Saguaro: 25x50 -->
  <g fill="currentColor">
    <path d="M9 3h6v47H9V3z" />
    <path d="M1 14h5v21H1V14z M1 35h8v4H1z" />
    <path d="M15 27h9v4h-9z M19 13h5v16h-5V13z" />
    <!-- Flower Bud on top -->
    <circle cx="12" cy="2" r="3" fill="#FF4500" />
    <circle cx="12" cy="2" r="1.5" fill="#FFD700" />
    <rect x="11.5" y="6" width="1" height="40" fill="#FFFFFF" opacity="0.2" />
  </g>
</svg>
`,Pt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Tundra Ice Crystal: 17x35 -->
  <g fill="currentColor">
    <!-- Faceted sharp crystal spire -->
    <path d="M7 0l4 10v25H6V10L7 0z" />
    <!-- Left shard -->
    <path d="M1 10l3 5v10H1V10z" opacity="0.85" />
    <!-- Right shard -->
    <path d="M13 7l3 6v10h-3V7z" opacity="0.85" />
    <!-- Crystal facet highlights -->
    <path d="M7 0l2 12v23h-1V12L7 0z" fill="#FFFFFF" opacity="0.5" />
  </g>
</svg>
`,It=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <!-- Tundra Ice Spire: 25x50 -->
  <g fill="currentColor">
    <!-- Tall Ice Column -->
    <path d="M12 0l4 15v35H8V15L12 0z" />
    <path d="M1 15l5 6v15H1V15z" opacity="0.8" />
    <path d="M19 12l5 6v18h-5V12z" opacity="0.8" />
    <!-- Sharp Glint -->
    <path d="M12 0l2 18v32h-1V18L12 0z" fill="#FFFFFF" opacity="0.6" />
  </g>
</svg>
`,Gt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Volcanic Charred Cactus / Spike: 17x35 -->
  <g fill="currentColor">
    <path d="M5 0h4v35H5V0z" />
    <path d="M1 8h3v14H1V8z M1 22h4v3H1z" />
    <path d="M9 15h5v3H9z M13 5h3v10h-3V5z" />
    <!-- Lava cracks -->
    <path d="M7 6l2 8-2 6 2 10" stroke="#FF4500" stroke-width="1" fill="none" />
  </g>
</svg>
`,Ot=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <!-- Volcanic Obsidian Pillar: 25x50 -->
  <g fill="currentColor">
    <path d="M9 0h6v50H9V0z" />
    <path d="M1 12h5v22H1V12z M1 34h8v5H1z" />
    <path d="M15 25h9v5h-9z M19 11h5v16h-5V11z" />
    <!-- Lava cracks -->
    <path d="M12 4l3 12-3 10 3 14" stroke="#FF4500" stroke-width="1.2" fill="none" />
    <path d="M3 18l2 8" stroke="#FFD700" stroke-width="1" fill="none" />
  </g>
</svg>
`,Nt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Neon Wireframe Cactus: 17x35 -->
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="5" y="1" width="4" height="33" />
    <path d="M1 8h3v14H1z" />
    <path d="M1 22h4" />
    <path d="M13 5h3v10h-3z" />
    <path d="M9 15h4" />
  </g>
</svg>
`,Qt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <!-- Neon Wireframe Large: 25x50 -->
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="9" y="1" width="6" height="48" />
    <path d="M1 12h5v22H1z" />
    <path d="M1 34h8" />
    <path d="M19 11h5v16h-5z" />
    <path d="M15 27h9" />
  </g>
</svg>
`,Ht={"trex-idle":lt,"trex-run1":ht,"trex-run2":ct,"trex-duck1":dt,"trex-duck2":ut,"trex-dead":pt,"cactus-small-1":ft,"cactus-small-2":gt,"cactus-small-3":mt,"cactus-large-1":yt,"cactus-large-2":Ft,"cactus-large-3":wt,"ptero-1":Mt,"ptero-2":xt,cloud:bt,"moon-0":vt,"moon-1":Tt,"moon-2":St,"moon-3":At,"moon-4":Et,"moon-5":kt,"moon-6":Ct,star:Lt,restart:Dt,"canyon-small":Bt,"canyon-large":Rt,"tundra-small":Pt,"tundra-large":It,"volcanic-small":Gt,"volcanic-large":Ot,"neon-small":Nt,"neon-large":Qt};class Vt{cache=new Map;scale=1;dpr=1;constructor(){this.updateScale(1,1)}updateScale(t,e){this.scale===t&&this.dpr===e&&this.cache.size>0||(this.scale=t,this.dpr=e,this.cache.clear(),this.prewarmCommonSprites())}prewarmCommonSprites(){this.getSprite("trex-idle","#535353",44,47),this.getSprite("trex-run1","#535353",44,47),this.getSprite("trex-run2","#535353",44,47),this.getSprite("trex-duck1","#535353",59,25),this.getSprite("trex-duck2","#535353",59,25),this.getSprite("cactus-small-1","#4F6F52",17,35),this.getSprite("cactus-small-2","#4F6F52",34,35),this.getSprite("cactus-small-3","#4F6F52",51,35),this.getSprite("cactus-large-1","#4F6F52",25,50),this.getSprite("cactus-large-2","#4F6F52",50,50),this.getSprite("cactus-large-3","#4F6F52",75,50),this.getSprite("ptero-1","#535353",46,40),this.getSprite("ptero-2","#535353",46,40),this.getSprite("cloud","#FFFFFF",46,14),this.getSprite("star","#FFFFFF",9,9);for(let t=0;t<7;t++)this.getSprite(`moon-${t}`,"#F8FAFC",32,32)}getSprite(t,e="#535353",s,i){const o=Ht[t];if(!o)return null;const n=Math.max(1,Math.round(s*this.scale*this.dpr)),a=Math.max(1,Math.round(i*this.scale*this.dpr)),r=o.includes("currentColor"),c=`${t}_${r?e:"default"}_${n}_${a}`,u=this.cache.get(c);if(u)return u;const p=r?o.replace(/currentColor/g,e):o,v=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(p)}`,M=document.createElement("canvas");M.width=n,M.height=a;const b=M.getContext("2d"),S=new Image;return S.onload=()=>{b&&(b.imageSmoothingEnabled=!1,b.drawImage(S,0,0,n,a))},S.src=v,this.cache.set(c,M),M}}const _t={skyTop:"#FFFFFF",skyBottom:"#FFFFFF",dinoBody:"#535353",dinoShade:"#535353",cactus:"#535353",ground:"#535353",farDunes:"#FFFFFF",midDunes:"#FFFFFF",accent:"#535353"},zt={skyTop:"#000000",skyBottom:"#000000",dinoBody:"#FFFFFF",dinoShade:"#FFFFFF",cactus:"#FFFFFF",ground:"#FFFFFF",farDunes:"#000000",midDunes:"#000000",accent:"#FFFFFF"};function j(d){const t=d.replace("#","");if(t.length===3){const o=parseInt(t[0]+t[0],16),n=parseInt(t[1]+t[1],16),a=parseInt(t[2]+t[2],16);return[o,n,a]}const e=parseInt(t.substring(0,2),16),s=parseInt(t.substring(2,4),16),i=parseInt(t.substring(4,6),16);return[e,s,i]}function Ut(d,t,e){const s=o=>Math.max(0,Math.min(255,Math.round(o))),i=o=>s(o).toString(16).padStart(2,"0");return`#${i(d)}${i(t)}${i(e)}`}function D(d,t,e){const s=Math.max(0,Math.min(1,e)),[i,o,n]=j(d),[a,r,h]=j(t),c=i+(a-i)*s,u=o+(r-o)*s,p=n+(h-n)*s;return Ut(c,u,p)}function V(d,t,e){return{skyTop:D(d.skyTop,t.skyTop,e),skyBottom:D(d.skyBottom,t.skyBottom,e),dinoBody:D(d.dinoBody,t.dinoBody,e),dinoShade:D(d.dinoShade,t.dinoShade,e),cactus:D(d.cactus,t.cactus,e),ground:D(d.ground,t.ground,e),farDunes:D(d.farDunes,t.farDunes,e),midDunes:D(d.midDunes,t.midDunes,e),accent:D(d.accent,t.accent,e)}}class jt{farOffset=0;midOffset=0;update(t,e=1){this.farOffset=(this.farOffset+.1*t*e)%600,this.midOffset=(this.midOffset+.3*t*e)%600}drawSky(t,e,s,i,o=0){const n=t.createLinearGradient(0,0,0,s);n.addColorStop(0,i.skyTop),n.addColorStop(.7,i.skyBottom),n.addColorStop(1,i.ground),t.fillStyle=n,t.fillRect(0,0,e,s);const a=Math.max(0,1-o*1.5);if(a>.01){t.save(),t.globalAlpha=a;const r=t.createRadialGradient(390,26,4,390,26,32);r.addColorStop(0,"rgba(255, 235, 180, 0.7)"),r.addColorStop(.35,"rgba(255, 215, 140, 0.25)"),r.addColorStop(1,"rgba(255, 200, 100, 0)"),t.fillStyle=r,t.beginPath(),t.arc(390,26,32,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255, 250, 230, 0.9)",t.beginPath(),t.arc(390,26,9,0,Math.PI*2),t.fill(),t.restore()}}drawFarDunes(t,e,s,i=0){t.save();const o=this.farOffset,n=t.createLinearGradient(0,85,0,127);n.addColorStop(0,s.farDunes),n.addColorStop(1,s.midDunes),t.fillStyle=n,t.beginPath(),t.moveTo(0,127);for(let r=-o-300;r<=e+600;r+=300)t.bezierCurveTo(r+80,96,r+180,114,r+300,127);t.lineTo(e,127),t.lineTo(0,127),t.closePath(),t.fill();const a=Math.max(.02,.1*(1-i*.7));t.strokeStyle=`rgba(255, 255, 255, ${a})`,t.lineWidth=1,t.stroke(),t.restore()}drawMidDunes(t,e,s,i=0){t.save();const o=this.midOffset,n=t.createLinearGradient(0,105,0,127);n.addColorStop(0,s.midDunes),n.addColorStop(1,s.ground),t.fillStyle=n,t.beginPath(),t.moveTo(0,127);for(let r=-o-200;r<=e+400;r+=200)t.quadraticCurveTo(r+50,112,r+100,116),t.quadraticCurveTo(r+150,120,r+200,127);t.lineTo(e,127),t.lineTo(0,127),t.closePath(),t.fill();const a=Math.max(.02,.08*(1-i*.7));t.strokeStyle=`rgba(255, 255, 255, ${a})`,t.lineWidth=1,t.stroke(),t.restore()}reset(){this.farOffset=0,this.midOffset=0}}class Wt{maxParticles=100;pool=[];runDustTimer=0;constructor(){for(let t=0;t<this.maxParticles;t++)this.pool.push({x:0,y:0,vx:0,vy:0,size:2,color:"#8A8A8A",alpha:1,decay:.05,active:!1})}spawn(t,e,s,i,o,n,a=.8,r=.04){const h=this.pool.find(c=>!c.active);h&&(h.x=t,h.y=e,h.vx=s,h.vy=i,h.size=o,h.color=n,h.alpha=a,h.decay=r,h.active=!0)}emitRunDust(t,e,s){this.runDustTimer++,this.runDustTimer>=6&&(this.runDustTimer=0,this.spawn(t+4,e+44,-1.5-Math.random()*.8,-.5-Math.random()*.5,2+Math.random()*1.5,s,.5,.06))}emitLandingDust(t,e,s){for(let i=0;i<6;i++){const o=Math.PI/6*i+Math.PI,n=1.2+Math.random()*1.5;this.spawn(t+20,e+44,Math.cos(o)*n,Math.sin(o)*.8,2.5+Math.random()*2,s,.7,.05)}}emitDeathBurst(t,e,s){for(let i=0;i<18;i++){const o=Math.random()*Math.PI*2,n=1.5+Math.random()*3.5;this.spawn(t+22,e+24,Math.cos(o)*n,Math.sin(o)*n,2+Math.random()*2.5,s,.9,.035)}}update(t=1){for(let e=0;e<this.maxParticles;e++){const s=this.pool[e];s.active&&(s.x+=s.vx*t,s.y+=s.vy*t,s.alpha-=s.decay*t,s.alpha<=0&&(s.active=!1))}}draw(t){t.save();for(let e=0;e<this.maxParticles;e++){const s=this.pool[e];s.active&&(t.globalAlpha=Math.max(0,s.alpha),t.fillStyle=s.color,t.fillRect(Math.round(s.x),Math.round(s.y),s.size,s.size))}t.restore()}reset(){for(let t=0;t<this.maxParticles;t++)this.pool[t].active=!1;this.runDustTimer=0}}class Zt{draw(t,e,s){t.save(),t.font="bold 11px ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace";const i=String(e.score).padStart(5,"0"),o=`HI ${String(e.highScore).padStart(5,"0")}`;t.fillStyle=e.isNight?"#7A8499":"#8A8A8A",t.fillText(o,480,20),(!e.isFlashing||e.flashIterations%2===0)&&(t.fillStyle=e.isFlashing?s.accent:s.dinoBody,t.fillText(i,550,20)),t.restore()}}class Yt{overlayEl;muteBtn=null;retroBtn=null;aiBtn=null;themeBtn=null;uiBar=null;onMuteClick;onRetroClick;onAIClick;onThemeClick;constructor(){this.overlayEl=document.getElementById("overlay"),this.setupDomButtons()}setupDomButtons(){this.overlayEl&&(this.overlayEl.innerHTML=`
      <div class="ui-bar" role="toolbar" aria-label="Game controls">
        <div class="ui-bar-group">
          <button id="btn-theme" class="ui-btn" aria-label="Toggle light or dark theme" title="Toggle Theme (T)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span class="btn-text">THEME: LIGHT</span>
          </button>
          <div class="ui-divider"></div>
          <button id="btn-mute" class="ui-btn is-on" aria-label="Toggle sound" title="Toggle SFX (M)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            <span class="btn-text">SFX: ON</span>
          </button>
          <div class="ui-divider"></div>
          <button id="btn-retro" class="ui-btn" aria-label="Toggle retro mode" title="Toggle Visual Mode (R)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
            <span class="btn-text">RETRO: OFF</span>
          </button>
          <div class="ui-divider"></div>
          <button id="btn-ai" class="ui-btn" aria-label="Toggle AI policy" title="Toggle AI Auto-Pilot (A)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
              <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
            </svg>
            <span class="btn-text">AI: OFF</span>
          </button>
        </div>
        <div class="ui-hints">
          <span class="hint-item"><kbd class="kbd">SPACE</kbd> / <kbd class="kbd">↑</kbd> Jump</span>
          <span class="hint-item"><kbd class="kbd">↓</kbd> Duck</span>
          <span class="hint-item"><kbd class="kbd">A</kbd> AI Mode</span>
          <span class="hint-item"><kbd class="kbd">T</kbd> Theme</span>
          <span class="hint-item"><kbd class="kbd">R</kbd> Retro</span>
          <span class="hint-item"><kbd class="kbd">M</kbd> Mute</span>
        </div>
      </div>
    `,this.uiBar=this.overlayEl.querySelector(".ui-bar"),this.themeBtn=document.getElementById("btn-theme"),this.muteBtn=document.getElementById("btn-mute"),this.retroBtn=document.getElementById("btn-retro"),this.aiBtn=document.getElementById("btn-ai"),this.themeBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onThemeClick?.()}),this.muteBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onMuteClick?.()}),this.retroBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onRetroClick?.()}),this.aiBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onAIClick?.()}))}updateButtons(t,e,s="OFF",i="light"){if(this.themeBtn){const n=i==="light"?'<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>':'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';this.themeBtn.innerHTML=`<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${n}</svg><span class="btn-text">THEME: ${i.toUpperCase()}</span>`}if(this.muteBtn){const o=t?'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>':'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';this.muteBtn.innerHTML=`<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${o}</svg><span class="btn-text">${t?"SFX: OFF":"SFX: ON"}</span>`,this.muteBtn.classList.toggle("is-off",t),this.muteBtn.classList.toggle("is-on",!t)}if(this.retroBtn){const o=e?'<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1.5" fill="currentColor"></circle><circle cx="10" cy="12" r="1.5" fill="currentColor"></circle><line x1="15" y1="9" x2="19" y2="9"></line><line x1="17" y1="13" x2="17" y2="17"></line>':'<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';this.retroBtn.innerHTML=`<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${o}</svg><span class="btn-text">${e?"RETRO: ON":"RETRO: OFF"}</span>`,this.retroBtn.classList.toggle("is-retro-active",e)}if(this.aiBtn){let o="AI: OFF";s==="NAIVE"?o="📏 11*S (71%)":s==="LINEAR"?o="⚡ 3-BYTE (100%)":s==="ANN"?o="🧠 NEURAL NET":s==="EVOLUTION"&&(o="🧬 EVOLVE (GHOST)");const n=s!=="OFF";this.aiBtn.innerHTML=`
        <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
          <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
        </svg>
        <span class="btn-text">${o}</span>
      `,this.aiBtn.classList.toggle("is-ai-active",n)}}setNightTheme(t){this.uiBar&&this.uiBar.classList.toggle("night",t)}draw(t,e,s,i,o,n="OFF",a=null,r=null){if(this.setNightTheme(e.isNight),t.save(),n!=="OFF"&&this.drawAIDebug(t,e,n,a,r),e.phase==="READY")t.fillStyle=i,t.font="12px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center",t.fillText(n!=="OFF"?"AI AUTO-PILOT ACTIVE — STARTING...":"PRESS SPACE OR TAP TO PLAY",o/2,75);else if(e.phase==="CRASHED"){t.fillStyle=i,t.font="bold 16px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center",t.fillText("G A M E   O V E R",o/2,65);const h=s.getSprite("restart",i,36,32);h&&t.drawImage(h,o/2-18,80,36,32),t.font="10px ui-monospace, SF Mono, Menlo, monospace",t.fillText("TAP OR PRESS SPACE TO RESTART",o/2,126)}t.restore()}drawAIDebug(t,e,s,i,o){const n=e.trex,a=n.x+n.w,r=n.y+14;if(t.save(),i?.targetObs&&i.distance!==void 0&&i.distance>0){const h=i.targetObs,c=i.action==="JUMP"||i.action==="DUCK";t.beginPath(),t.strokeStyle=c?"rgba(239, 68, 68, 0.45)":"rgba(56, 189, 248, 0.35)",t.lineWidth=1,t.setLineDash([4,4]),t.moveTo(a,r),t.lineTo(h.x,h.y+6),t.stroke(),t.setLineDash([]),t.strokeStyle=c?"#ef4444":"#38bdf8",t.lineWidth=1.2;const u=5;t.beginPath(),t.moveTo(h.x-3,h.y+u),t.lineTo(h.x-3,h.y-3),t.lineTo(h.x+u,h.y-3),t.stroke(),t.fillStyle=c?"#ef4444":"#38bdf8",t.font="bold 8px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center",t.fillText(`${Math.round(i.distance)}px`,h.x+h.w/2,h.y-6)}t.restore()}}const H=[{id:"desert",name:"Classic Desert",weatherType:"sand",dayPalette:{skyTop:"#F7F7F2",skyBottom:"#E9EEF2",dinoBody:"#535353",dinoShade:"#3E3E3E",cactus:"#4F6F52",ground:"#535353",farDunes:"#E3DCCB",midDunes:"#D2C8AE",accent:"#FFB020"},nightPalette:{skyTop:"#0F172A",skyBottom:"#1E293B",dinoBody:"#F8FAFC",dinoShade:"#CBD5E1",cactus:"#34D399",ground:"#334155",farDunes:"#162033",midDunes:"#1E293B",accent:"#38BDF8"}},{id:"canyon",name:"Canyon Sunset",weatherType:"fireflies",dayPalette:{skyTop:"#FFD9A8",skyBottom:"#FFAE73",dinoBody:"#3F2822",dinoShade:"#2B1A16",cactus:"#E88B5A",ground:"#5A3A32",farDunes:"#E88B5A",midDunes:"#C55A3C",accent:"#FF6B35"},nightPalette:{skyTop:"#1E132D",skyBottom:"#2C1A40",dinoBody:"#F5EEF8",dinoShade:"#D8BFD8",cactus:"#E07A5F",ground:"#3B284A",farDunes:"#261536",midDunes:"#1C0F28",accent:"#FF6B35"}},{id:"oasis",name:"Oasis Sanctuary",weatherType:"rain",dayPalette:{skyTop:"#DFF3EA",skyBottom:"#C1EAD8",dinoBody:"#374E45",dinoShade:"#23372F",cactus:"#2EC4B6",ground:"#4A5A4F",farDunes:"#A8D5BA",midDunes:"#6FB38A",accent:"#2EC4B6"},nightPalette:{skyTop:"#051E22",skyBottom:"#0B2D33",dinoBody:"#E6FFFA",dinoShade:"#A7F3D0",cactus:"#2DD4BF",ground:"#134E4A",farDunes:"#08282E",midDunes:"#0E3840",accent:"#2EC4B6"}},{id:"tundra",name:"Frozen Tundra",weatherType:"snow",dayPalette:{skyTop:"#E8F4FF",skyBottom:"#D0E8FC",dinoBody:"#38485B",dinoShade:"#243242",cactus:"#7DF9FF",ground:"#55677A",farDunes:"#C9E3F5",midDunes:"#A4CBE6",accent:"#7DF9FF"},nightPalette:{skyTop:"#0A1128",skyBottom:"#132247",dinoBody:"#F0F9FF",dinoShade:"#BAE6FD",cactus:"#38BDF8",ground:"#1E293B",farDunes:"#0E1736",midDunes:"#16254F",accent:"#7DF9FF"}},{id:"volcanic",name:"Volcanic Badlands",weatherType:"embers",dayPalette:{skyTop:"#8C7B75",skyBottom:"#71605A",dinoBody:"#2B2322",dinoShade:"#1C1514",cactus:"#FF4500",ground:"#2B2322",farDunes:"#5A4A47",midDunes:"#3D302E",accent:"#FF4500"},nightPalette:{skyTop:"#180A0C",skyBottom:"#261014",dinoBody:"#FFE4E6",dinoShade:"#FECDD3",cactus:"#FB7185",ground:"#2E1217",farDunes:"#1F0B0E",midDunes:"#2A1014",accent:"#FF4500"}},{id:"neon",name:"Neon Future",weatherType:"grid",dayPalette:{skyTop:"#1B1033",skyBottom:"#28174D",dinoBody:"#00F0FF",dinoShade:"#00B8C4",cactus:"#FF2E97",ground:"#2A1B4D",farDunes:"#3A1B6E",midDunes:"#5B2A9B",accent:"#FF2E97"},nightPalette:{skyTop:"#080414",skyBottom:"#12072B",dinoBody:"#00F0FF",dinoShade:"#00B8C4",cactus:"#FF2E97",ground:"#2A1352",farDunes:"#15082E",midDunes:"#1E0A40",accent:"#FF2E97"}},{id:"space",name:"Space Dunes",weatherType:"cosmic",dayPalette:{skyTop:"#0B0F2A",skyBottom:"#151C47",dinoBody:"#D8B4FE",dinoShade:"#A855F7",cactus:"#C084FC",ground:"#151C47",farDunes:"#1E255E",midDunes:"#2C3582",accent:"#B388FF"},nightPalette:{skyTop:"#05081A",skyBottom:"#0D1438",dinoBody:"#F3E8FF",dinoShade:"#D8B4FE",cactus:"#A855F7",ground:"#23184A",farDunes:"#090D2A",midDunes:"#121740",accent:"#B388FF"}}];class Xt{currentBiomeIndex=0;targetBiomeIndex=0;transitionProgress=1;transitionDurationMs=3e3;get currentBiome(){return H[this.currentBiomeIndex%H.length]}get targetBiome(){return H[this.targetBiomeIndex%H.length]}update(t,e){let s=!1;return t!==this.targetBiomeIndex&&(this.currentBiomeIndex=this.targetBiomeIndex,this.targetBiomeIndex=t,this.transitionProgress=0,s=!0),this.transitionProgress<1&&(this.transitionProgress=Math.min(1,this.transitionProgress+e/this.transitionDurationMs),this.transitionProgress>=1&&(this.currentBiomeIndex=this.targetBiomeIndex)),{transitioned:s}}getPalette(t,e){const s=this.currentBiome,i=this.targetBiome,o=V(s.dayPalette,s.nightPalette,e);if(this.transitionProgress>=1)return o;const n=V(i.dayPalette,i.nightPalette,e);return V(o,n,this.transitionProgress)}}class qt{weatherParticles=[];maxWeatherParticles=50;ufoX=-100;ufoActive=!1;lizardX=-50;lizardActive=!1;constructor(){for(let t=0;t<this.maxWeatherParticles;t++)this.weatherParticles.push({x:Math.random()*600,y:Math.random()*125,vx:-1-Math.random()*2,vy:.2+Math.random()*.5,size:1.5,alpha:.4+Math.random()*.4,color:"#FFFFFF"})}update(t,e,s,i=1){for(let o=0;o<this.maxWeatherParticles;o++){const n=this.weatherParticles[o];switch(t){case"sand":n.vx=-e*.4-Math.random()*1,n.vy=(Math.random()-.5)*.3,n.color="#D2C8AE",n.size=1.5;break;case"snow":n.vx=-e*.2-.5,n.vy=.8+Math.random()*.5,n.color="#FFFFFF",n.size=2;break;case"embers":n.vx=-e*.3-.8,n.vy=-.6-Math.random()*.6,n.color=Math.random()>.5?"#FF4500":"#FFD700",n.size=1.8;break;case"rain":n.vx=-e*.5-2,n.vy=4+Math.random()*2,n.color="#7DF9FF",n.size=2;break;case"fireflies":case"cosmic":default:n.vx=-e*.2+(Math.random()-.5)*.5,n.vy=(Math.random()-.5)*.4,n.color="#FFDE59",n.size=1.8;break}n.x+=n.vx*i,n.y+=n.vy*i,n.x<0&&(n.x=600),n.x>600&&(n.x=0),n.y<0&&(n.y=125),n.y>125&&(n.y=0)}!this.lizardActive&&Math.random()<.002&&(this.lizardActive=!0,this.lizardX=620),this.lizardActive&&(this.lizardX-=(e+2)*i,this.lizardX<-40&&(this.lizardActive=!1)),!this.ufoActive&&s>2e3&&s%3e3<150&&(this.ufoActive=!0,this.ufoX=650),this.ufoActive&&(this.ufoX-=2*i,this.ufoX<-80&&(this.ufoActive=!1))}draw(t,e){if(!e){t.save();for(let s=0;s<this.maxWeatherParticles;s++){const i=this.weatherParticles[s];t.globalAlpha=i.alpha,t.fillStyle=i.color,t.beginPath(),t.arc(i.x,i.y,Math.max(.6,i.size/2),0,Math.PI*2),t.fill()}this.lizardActive&&(t.globalAlpha=.5,t.fillStyle="#654321",t.fillRect(Math.round(this.lizardX),125,8,2),t.fillRect(Math.round(this.lizardX+7),124,3,2)),this.ufoActive&&(t.globalAlpha=.8,t.fillStyle="#B0C4DE",t.beginPath(),t.ellipse(this.ufoX,22,12,4,0,0,Math.PI*2),t.fill(),t.fillStyle="#00FFFF",t.beginPath(),t.arc(this.ufoX,20,5,Math.PI,0),t.fill(),t.fillStyle="#00FFCC",t.globalAlpha=.15,t.beginPath(),t.moveTo(this.ufoX-2,26),t.lineTo(this.ufoX+2,26),t.lineTo(this.ufoX+10,60),t.lineTo(this.ufoX-10,60),t.closePath(),t.fill()),t.restore()}}}class $t{hasSunglasses=!1;nearMissTimerMs=0;milestoneTimerMs=0;idleTimeMs=0;triggerNearMiss(){this.nearMissTimerMs=500}triggerMilestone(){this.milestoneTimerMs=800}update(t,e){this.nearMissTimerMs>0&&(this.nearMissTimerMs-=e),this.milestoneTimerMs>0&&(this.milestoneTimerMs-=e),t.phase==="READY"?this.idleTimeMs+=e:this.idleTimeMs=0}drawOverlays(t,e,s){if(s)return;const i=e.trex;if(t.save(),this.hasSunglasses){t.fillStyle="#111111";const o=i.ducking?i.x+i.w-18:i.x+23,n=i.ducking?i.y+3:i.y+1;t.fillRect(o-1,n,10,4),t.fillStyle="#00FFFF",t.fillRect(o+1,n+1,2,2),t.fillRect(o+6,n+1,2,2)}if(this.nearMissTimerMs>0){t.fillStyle="#00E5FF";const o=i.x+18,n=i.y-4;t.beginPath(),t.arc(o,n,2.5,0,Math.PI*2),t.fill()}if(e.phase==="READY"&&this.idleTimeMs>1e4){t.fillStyle="#999999",t.font="bold 9px monospace";const o=Math.sin(this.idleTimeMs/400)*4;t.fillText("z",i.x+28,i.y-4+o),t.fillText("Z",i.x+36,i.y-12+o)}t.restore()}}class Kt{badgeText=null;badgeTimerMs=0;badgeDurationMs=1200;bannerText=null;bannerTimerMs=0;bannerDurationMs=1500;badgeAdjectives=["Nice!","Smooth!","Speedy!","Unstoppable!"];lastAwardedMilestone=0;checkMilestone(t){if(t>=500&&Math.floor(t/500)>Math.floor(this.lastAwardedMilestone/500)){const e=Math.floor(t/500)*500;this.lastAwardedMilestone=t;const s=(e/500-1)%this.badgeAdjectives.length;this.showBadge(`${e} · ${this.badgeAdjectives[s]}`)}}showBadge(t){this.badgeText=t,this.badgeTimerMs=this.badgeDurationMs}showBiomeBanner(t){this.bannerText=t.toUpperCase(),this.bannerTimerMs=this.bannerDurationMs}update(t){this.badgeTimerMs>0&&(this.badgeTimerMs-=t,this.badgeTimerMs<=0&&(this.badgeText=null)),this.bannerTimerMs>0&&(this.bannerTimerMs-=t,this.bannerTimerMs<=0&&(this.bannerText=null))}draw(t,e,s){if(!s){if(t.save(),t.textAlign="center",this.bannerText&&this.bannerTimerMs>0){const i=Math.min(1,this.bannerTimerMs/300);t.globalAlpha=i,t.font="bold 12px ui-monospace, SF Mono, Menlo, monospace",t.fillStyle="#FFB020",t.fillText(`— ${this.bannerText} —`,e/2,38)}if(this.badgeText&&this.badgeTimerMs>0){const i=Math.min(1,this.badgeTimerMs/300);t.globalAlpha=i,t.fillStyle="rgba(0, 0, 0, 0.7)",t.beginPath(),t.roundRect(e/2-60,48,120,20,10),t.fill(),t.fillStyle="#FFFFFF",t.font="bold 10px ui-monospace, SF Mono, Menlo, monospace",t.fillText(this.badgeText,e/2,62)}t.restore()}}reset(){this.badgeText=null,this.badgeTimerMs=0,this.bannerText=null,this.bannerTimerMs=0,this.lastAwardedMilestone=0}}class Jt{pulseTime=0;inputLabels=["dist","width","height","elev","dino_y","vel_y","speed"];outputLabels=["RUN","JUMP","DUCK"];update(t){this.pulseTime+=t*.003}draw(t,e,s,i,o,n){t.save(),t.fillStyle="rgba(8, 12, 20, 0.88)",t.strokeStyle="rgba(255, 255, 255, 0.12)",t.lineWidth=1,this.roundRect(t,s,i,o,n,8),t.fill(),t.stroke();const a=36,r=16,h=o-a*2,c=n-r*2,u=s+a,p=s+a+h*.48,w=s+o-a,v=e.inputs.length,M=e.hidden.length,b=e.outputs.length,S=this.getYPositions(i+r,c,v),E=this.getYPositions(i+r,c,M),R=this.getYPositions(i+r+12,c-24,b);for(let l=0;l<v;l++){const f=S[l],g=Math.min(1,Math.max(0,e.inputs[l]));for(let m=0;m<M;m++){const x=E[m],T=e.w1[l]?e.w1[l][m]:0,C=Math.abs(T*g);if(C>.05){const A=Math.min(.65,C*.35+.08);t.beginPath(),t.strokeStyle=T>=0?`rgba(234, 179, 8, ${A})`:`rgba(236, 72, 153, ${A*.8})`,t.lineWidth=Math.min(2,.5+C*.8);const L=u+(p-u)*.5,B=u+(p-u)*.5;t.moveTo(u,f),t.bezierCurveTo(L,f,B,x,p,x),t.stroke()}}}for(let l=0;l<M;l++){const f=E[l],g=Math.min(1,e.hidden[l]);for(let m=0;m<b;m++){const x=R[m],T=e.w2[l]?e.w2[l][m]:0,C=Math.abs(T*g);if(C>.05){const A=m===e.actionIndex,L=Math.min(.85,C*.4+(A?.3:.05));t.beginPath(),t.strokeStyle=A?`rgba(52, 211, 153, ${L})`:`rgba(245, 158, 11, ${L*.6})`,t.lineWidth=A?1.8:.7;const B=p+(w-p)*.5,P=p+(w-p)*.5;t.moveTo(p,f),t.bezierCurveTo(B,f,P,x,w,x),t.stroke()}}}for(let l=0;l<v;l++){const f=S[l],g=Math.min(1,Math.max(0,e.inputs[l]));if(t.fillStyle="rgba(203, 213, 225, 0.75)",t.font="7.5px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="right",t.fillText(this.inputLabels[l]||`in_${l}`,u-6,f+2.5),t.beginPath(),t.arc(u,f,4.5,0,Math.PI*2),t.fillStyle="#1e293b",t.fill(),t.strokeStyle="rgba(255, 255, 255, 0.3)",t.lineWidth=1,t.stroke(),g>.02){t.beginPath();const m=Math.max(1.5,g*3.5);t.arc(u,f,m,0,Math.PI*2),t.fillStyle="#bef264",t.shadowColor="#bef264",t.shadowBlur=6*g,t.fill(),t.shadowBlur=0}}for(let l=0;l<M;l++){const f=E[l],g=Math.min(1,Math.max(0,e.hidden[l]));t.beginPath(),t.arc(p,f,3.5,0,Math.PI*2),t.fillStyle="#1e293b",t.fill(),t.strokeStyle="rgba(255, 255, 255, 0.2)",t.lineWidth=.8,t.stroke(),g>.02&&(t.beginPath(),t.arc(p,f,Math.max(1.2,g*2.8),0,Math.PI*2),t.fillStyle="#f59e0b",t.shadowColor="#f59e0b",t.shadowBlur=5*g,t.fill(),t.shadowBlur=0)}for(let l=0;l<b;l++){const f=R[l],g=l===e.actionIndex,m=e.outputs[l]||0;t.beginPath(),t.arc(w,f,g?5.5:4.5,0,Math.PI*2),t.fillStyle=g?"#064e3b":"#1e293b",t.fill(),t.strokeStyle=g?"#34d399":"rgba(255, 255, 255, 0.3)",t.lineWidth=g?1.5:.8,t.stroke(),g&&(t.beginPath(),t.arc(w,f,3.2,0,Math.PI*2),t.fillStyle="#34d399",t.shadowColor="#34d399",t.shadowBlur=8,t.fill(),t.shadowBlur=0),t.fillStyle=g?"#34d399":"rgba(148, 163, 184, 0.7)",t.font=g?"bold 8px ui-monospace, SF Mono, Menlo, monospace":"7.5px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="left";const x=Math.round(m*100);t.fillText(`${this.outputLabels[l]} ${x}%`,w+7,f+2.5)}t.fillStyle="rgba(148, 163, 184, 0.6)",t.font="7.5px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center";const G=".".repeat(Math.floor(this.pulseTime*2)%3+1);t.fillText(`thinking${G}`,p,i+n-4),t.restore()}getYPositions(t,e,s){const i=e/(s-1),o=[];for(let n=0;n<s;n++)o.push(t+n*i);return o}roundRect(t,e,s,i,o,n){t.beginPath(),t.moveTo(e+n,s),t.arcTo(e+i,s,e+i,s+o,n),t.arcTo(e+i,s+o,e,s+o,n),t.arcTo(e,s+o,e,s,n),t.arcTo(e,s,e+i,s,n),t.closePath()}}class te{ctx;camera;atlas;layers;particles;hud;overlay;biomes;props;expressions;badges;neuralViz;showHitboxes=!1;isRetro=!1;reducedEffects=!1;screenShakeTimeMs=0;screenShakeIntensity=0;flashTimeMs=0;squashStretchX=1;squashStretchY=1;slowFrameCounter=0;autoDegraded=!1;constructor(t,e){const s=t.getContext("2d");if(!s)throw new Error("Failed to get 2D rendering context");this.ctx=s,this.camera=e,this.atlas=new Vt,this.layers=new jt,this.particles=new Wt,this.hud=new Zt,this.overlay=new Yt,this.biomes=new Xt,this.props=new qt,this.expressions=new $t,this.badges=new Kt,this.neuralViz=new Jt,this.camera.onResize(()=>{this.atlas.updateScale(this.camera.scale,this.camera.dpr)})}draw(t,e=1,s="OFF",i=null,o=null){const n=this.ctx,a=1e3/60;this.atlas.updateScale(this.camera.scale,this.camera.dpr);const{transitioned:r}=this.biomes.update(t.biomeIndex,a);r&&!this.isRetro&&this.badges.showBiomeBanner(this.biomes.targetBiome.name),this.badges.checkMilestone(t.score),this.badges.update(a),this.expressions.update(t,a),this.neuralViz.update(a),!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.props.update(this.biomes.currentBiome.weatherType,t.speed,t.score,1),this.processEvents(t),this.updateVisualEffects(t),this.camera.applyTransform(n);let h=0,c=0;this.screenShakeIntensity>0&&!this.reducedEffects&&!this.isRetro&&(h=(Math.random()-.5)*this.screenShakeIntensity*2,c=(Math.random()-.5)*this.screenShakeIntensity*2,n.translate(h,c));const u=this.computePalette(t);this.isRetro?(n.fillStyle=u.skyTop,n.fillRect(0,0,this.camera.logicalWidth,this.camera.logicalHeight)):(this.layers.drawSky(n,this.camera.logicalWidth,this.camera.logicalHeight,u,t.nightFade),(t.isNight||t.nightFade>.05)&&(n.save(),n.globalAlpha=t.nightFade,this.drawNightSky(t),n.restore()),this.layers.drawFarDunes(n,this.camera.logicalWidth,u,t.nightFade));for(const p of t.clouds){n.save(),!this.isRetro&&(t.isNight||t.nightFade>.1)&&(n.globalAlpha=Math.max(.3,1-t.nightFade*.55));const w=this.atlas.getSprite("cloud","#FFFFFF",46,14);w&&n.drawImage(w,p.x,p.y,46,14),n.restore()}this.isRetro||(this.layers.drawMidDunes(n,this.camera.logicalWidth,u,t.nightFade),!this.reducedEffects&&!this.autoDegraded&&this.props.draw(n,this.isRetro)),this.drawGround(t,u.ground),!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.particles.draw(n),this.drawSpeedLines(t),this.drawObstacles(t,u.cactus,u.dinoBody),this.drawTrex(t,u.dinoBody),this.expressions.drawOverlays(n,t,this.isRetro),this.drawVignette(),this.hud.draw(n,t,u),this.badges.draw(n,this.camera.logicalWidth,this.isRetro),this.overlay.draw(n,t,this.atlas,u.dinoBody,this.camera.logicalWidth,s,i,o),this.flashTimeMs>0&&!this.reducedEffects&&!this.isRetro&&(n.save(),n.fillStyle="#FFFFFF",n.globalAlpha=Math.min(1,this.flashTimeMs/80),n.fillRect(0,0,this.camera.logicalWidth,this.camera.logicalHeight),n.restore())}recordFrameDuration(t){t>16.6?(this.slowFrameCounter++,this.slowFrameCounter>120&&(this.autoDegraded=!0)):this.slowFrameCounter=Math.max(0,this.slowFrameCounter-1)}computePalette(t){return this.isRetro?t.isNight?zt:_t:this.biomes.getPalette(t.isNight,t.nightFade)}processEvents(t){for(const e of t.events)e==="jump"?(this.squashStretchX=.92,this.squashStretchY=1.08):e==="land"?(this.squashStretchX=1.08,this.squashStretchY=.92,!this.isRetro&&!this.reducedEffects&&this.particles.emitLandingDust(t.trex.x,t.trex.y,"#8A8A8A")):e==="crash"?!this.reducedEffects&&!this.isRetro&&(this.screenShakeTimeMs=300,this.screenShakeIntensity=6,this.flashTimeMs=80,this.particles.emitDeathBurst(t.trex.x,t.trex.y,"#535353")):e==="nearMiss"?this.expressions.triggerNearMiss():e==="milestone"&&this.expressions.triggerMilestone();t.phase==="RUNNING"&&!t.trex.jumping&&!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.particles.emitRunDust(t.trex.x,t.trex.y,"#8A8A8A")}updateVisualEffects(t){const e=16.666666666666668;this.screenShakeTimeMs>0&&(this.screenShakeTimeMs-=e,this.screenShakeIntensity=Math.max(0,this.screenShakeTimeMs/300*6)),this.flashTimeMs>0&&(this.flashTimeMs-=e),this.squashStretchX+=(1-this.squashStretchX)*.15,this.squashStretchY+=(1-this.squashStretchY)*.15,(t.phase==="RUNNING"||t.phase==="INTRO")&&this.layers.update(t.speed,1),this.particles.update(1)}drawNightSky(t){const e=this.ctx,i=this.atlas.getSprite("star","#FFFFFF",9,9),o=[[35,20,!1],[75,14,!0],[115,32,!1],[160,18,!0],[210,38,!1],[255,15,!0],[395,22,!0],[435,36,!1],[515,16,!0],[570,34,!1]];for(const[h,c,u]of o)u&&i?e.drawImage(i,h-4,c-4,8,8):(e.fillStyle="rgba(255, 255, 255, 0.85)",e.beginPath(),e.arc(h,c,1.2,0,Math.PI*2),e.fill());const n=`moon-${t.moonPhase%7}`,a=this.atlas.getSprite(n,"#F8FAFC",32,32);e.save();const r=e.createRadialGradient(330,24,6,330,24,34);r.addColorStop(0,"rgba(240, 248, 255, 0.35)"),r.addColorStop(.4,"rgba(186, 230, 253, 0.12)"),r.addColorStop(1,"rgba(186, 230, 253, 0)"),e.fillStyle=r,e.beginPath(),e.arc(330,24,34,0,Math.PI*2),e.fill(),a&&e.drawImage(a,314,8,32,32),e.restore()}drawGround(t,e){const s=this.ctx,i=this.camera.logicalWidth;if(this.isRetro){s.strokeStyle=e,s.lineWidth=1,s.beginPath(),s.moveTo(0,127.5),s.lineTo(i,127.5),s.stroke(),s.fillStyle=e;const p=t.groundOffset%40;for(let w=-p;w<i;w+=40)s.fillRect(w,130,4,1.5),s.fillRect(w+18,134,6,1.5);return}s.save();const o=t.isNight||t.nightFade>.25,n=s.createLinearGradient(0,127,0,150),a=o?"#221930":e,r=o?"#100B17":"#0F172A";n.addColorStop(0,a),n.addColorStop(1,r),s.fillStyle=n,s.fillRect(0,127,i,23),s.strokeStyle=o?"#5A4A70":e,s.lineWidth=1.5,s.beginPath(),s.moveTo(0,127.5),s.lineTo(i,127.5),s.stroke();const h=t.groundOffset%60,c=o?"rgba(255, 255, 255, 0.12)":"rgba(255, 255, 255, 0.22)",u=o?"rgba(0, 0, 0, 0.35)":"rgba(0, 0, 0, 0.28)";for(let p=-h;p<i+60;p+=60)s.fillStyle=c,s.beginPath(),s.ellipse(p+14,131,2,1,0,0,Math.PI*2),s.fill(),s.fillStyle=u,s.beginPath(),s.ellipse(p+38,134,2.5,1.2,0,0,Math.PI*2),s.fill(),s.fillStyle=o?"rgba(255, 255, 255, 0.05)":"rgba(255, 255, 255, 0.1)",s.fillRect(p+22,138,8,1),s.fillRect(p+46,142,6,1);s.restore()}drawDropShadow(t,e,s,i,o){const n=this.ctx;n.save(),n.fillStyle=`rgba(0, 0, 0, ${o})`,n.beginPath(),n.ellipse(t,e,Math.max(1,s),Math.max(.5,i),0,0,Math.PI*2),n.fill(),n.restore()}drawObstacles(t,e,s){const i=this.ctx,o=this.biomes.currentBiome.id;if(!this.isRetro)for(const n of t.obstacles)if(n.type==="CACTUS_SMALL"||n.type==="CACTUS_LARGE")this.drawDropShadow(n.x+n.w/2,139,n.w*.42,2.5,.22);else{const a=Math.max(0,140-(n.y+n.h)),r=Math.max(.3,1-a/100),h=Math.max(.04,.16*r);this.drawDropShadow(n.x+n.w/2,139,n.w*.45*r,2*r,h)}for(const n of t.obstacles){let a,r;n.type==="CACTUS_SMALL"?(r=e,!this.isRetro&&n.size===1?o==="canyon"?a="canyon-small":o==="tundra"?a="tundra-small":o==="volcanic"?a="volcanic-small":o==="neon"?a="neon-small":a="cactus-small-1":a=n.size===3?"cactus-small-3":n.size===2?"cactus-small-2":"cactus-small-1"):n.type==="CACTUS_LARGE"?(r=e,!this.isRetro&&n.size===1?o==="canyon"?a="canyon-large":o==="tundra"?a="tundra-large":o==="volcanic"?a="volcanic-large":o==="neon"?a="neon-large":a="cactus-large-1":a=n.size===3?"cactus-large-3":n.size===2?"cactus-large-2":"cactus-large-1"):(r=s,a=n.frame===1?"ptero-2":"ptero-1");const h=this.atlas.getSprite(a,r,n.w,n.h);if(h?i.drawImage(h,n.x,n.y,n.w,n.h):(i.fillStyle=r,i.fillRect(n.x,n.y,n.w,n.h)),this.showHitboxes){i.strokeStyle="#FF0000",i.lineWidth=1;for(const c of n.collisionBoxes)i.strokeRect(n.x+c.x,n.y+c.y,c.w,c.h)}}}drawTrex(t,e){const s=this.ctx,i=t.trex;if(!this.isRetro){const a=Math.max(0,93-i.y),r=Math.max(.32,1-a/110),h=Math.max(.04,.24*r);this.drawDropShadow(i.x+i.w/2,139,i.w*.42*r,2.5*r,h)}let o="trex-idle";t.phase==="CRASHED"?o="trex-dead":i.ducking?o=i.frame===1?"trex-duck2":"trex-duck1":i.jumping?o="trex-run1":t.phase==="RUNNING"||t.phase==="INTRO"?o=i.frame===1?"trex-run2":"trex-run1":o="trex-idle";const n=this.atlas.getSprite(o,e,i.w,i.h);s.save(),!this.isRetro&&!this.reducedEffects&&(this.squashStretchX!==1||this.squashStretchY!==1)&&(s.translate(i.x+i.w/2,i.y+i.h),s.scale(this.squashStretchX,this.squashStretchY),s.translate(-(i.x+i.w/2),-(i.y+i.h))),n?s.drawImage(n,i.x,i.y,i.w,i.h):(s.fillStyle=e,s.fillRect(i.x,i.y,i.w,i.h)),s.restore(),this.showHitboxes&&(s.strokeStyle="#00FF00",s.lineWidth=1,s.strokeRect(i.x,i.y,i.w,i.h))}drawSpeedLines(t){if(this.isRetro||t.speed<9.5||t.phase!=="RUNNING")return;const e=this.ctx;e.save();const s=Math.min(.2,(t.speed-9.5)*.05);e.strokeStyle=`rgba(255, 255, 255, ${s})`,e.lineWidth=1;const i=t.distance*8%600,o=[{y:35,len:45,offset:i*1.5%600},{y:60,len:65,offset:(i*1.8+200)%600},{y:85,len:35,offset:(i*1.2+400)%600},{y:110,len:50,offset:(i*2+100)%600}];for(const n of o){const a=600-n.offset;e.beginPath(),e.moveTo(a,n.y),e.lineTo(a+n.len,n.y),e.stroke()}e.restore()}drawVignette(){if(this.isRetro||this.reducedEffects)return;const t=this.ctx;t.save();const e=this.camera.logicalWidth,s=this.camera.logicalHeight,i=t.createRadialGradient(e/2,s/2,s*.7,e/2,s/2,e*.65);i.addColorStop(0,"rgba(0, 0, 0, 0)"),i.addColorStop(1,"rgba(0, 0, 0, 0.22)"),t.fillStyle=i,t.fillRect(0,0,e,s),t.restore()}}class ee{jumpPressed=!1;jumpHeld=!1;duckHeld=!1;restartPressed=!1;touchStartY=0;konamiProgress=0;konamiSequence=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","KeyB","KeyA"];onMuteToggle;onRetroToggle;onHitboxToggle;onKonamiCode;onAIToggle;onThemeToggle;constructor(t=window){t.addEventListener("keydown",this.handleKeyDown),t.addEventListener("keyup",this.handleKeyUp),t.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),t.addEventListener("touchend",this.handleTouchEnd,{passive:!1}),t.addEventListener("touchmove",this.handleTouchMove,{passive:!1}),t.addEventListener("touchcancel",this.handleTouchEnd,{passive:!1})}handleKeyDown=t=>{t.key==="F12"||t.ctrlKey&&t.shiftKey&&t.key==="I"||(t.code===this.konamiSequence[this.konamiProgress]?(this.konamiProgress++,this.konamiProgress===this.konamiSequence.length&&(this.konamiProgress=0,this.onKonamiCode?.())):this.konamiProgress=t.code===this.konamiSequence[0]?1:0,t.code==="Space"||t.code==="ArrowUp"||t.code==="KeyW"?(t.preventDefault(),this.jumpHeld||(this.jumpPressed=!0),this.jumpHeld=!0,this.restartPressed=!0):t.code==="ArrowDown"||t.code==="KeyS"?(t.preventDefault(),this.duckHeld=!0):t.code==="Enter"?(t.preventDefault(),this.restartPressed=!0):t.code==="KeyM"?this.onMuteToggle?.():t.code==="KeyR"?this.onRetroToggle?.():t.code==="KeyH"?this.onHitboxToggle?.():t.code==="KeyA"?this.onAIToggle?.():t.code==="KeyT"&&this.onThemeToggle?.())};handleKeyUp=t=>{t.code==="Space"||t.code==="ArrowUp"||t.code==="KeyW"?(t.preventDefault(),this.jumpHeld=!1):(t.code==="ArrowDown"||t.code==="KeyS")&&(t.preventDefault(),this.duckHeld=!1)};isButtonTarget(t){return!!(t&&(t.tagName==="BUTTON"||t.closest?.("button")))}handleTouchStart=t=>{const e=t.target;if(this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),t.touches.length===0))return;const s=t.touches[0];this.touchStartY=s.clientY;const i=document.getElementById("game"),o=i?i.getBoundingClientRect():null;(o?s.clientY>o.top+o.height*.6:s.clientY>window.innerHeight*.6)?(this.duckHeld=!0,this.jumpHeld=!1):(this.jumpPressed=!0,this.jumpHeld=!0,this.restartPressed=!0)};handleTouchMove=t=>{const e=t.target;if(this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),t.touches.length===0))return;t.touches[0].clientY-this.touchStartY>25&&(this.duckHeld=!0,this.jumpHeld=!1)};handleTouchEnd=t=>{const e=t.target;this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),this.jumpHeld=!1,this.duckHeld=!1)};consume(){const t={jumpPressed:this.jumpPressed,jumpHeld:this.jumpHeld,duckHeld:this.duckHeld,restartPressed:this.restartPressed};return this.jumpPressed=!1,this.restartPressed=!1,t}}class se{STEP_MS=1e3/60;MAX_DT=100;game;input;renderer;aiController;neuralPanel;accumulator=0;lastTime=0;animationFrameId=null;isPaused=!1;constructor(t,e,s,i=null,o=null){this.game=t,this.input=e,this.renderer=s,this.aiController=i,this.neuralPanel=o,document.addEventListener("visibilitychange",this.handleVisibilityChange)}start(){this.animationFrameId===null&&(this.lastTime=performance.now(),this.accumulator=0,this.isPaused=!1,this.animationFrameId=requestAnimationFrame(this.tick))}stop(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}handleVisibilityChange=()=>{document.hidden?this.isPaused=!0:(this.isPaused=!1,this.lastTime=performance.now(),this.accumulator=0)};tick=t=>{if(this.animationFrameId=requestAnimationFrame(this.tick),this.isPaused)return;const e=Math.min(t-this.lastTime,this.MAX_DT);for(this.lastTime=t,this.accumulator+=e;this.accumulator>=this.STEP_MS;){let a=this.input.consume();if(this.aiController&&this.aiController.mode!=="OFF"){const r=this.aiController.update(this.game.state);r&&(a={jumpPressed:a.jumpPressed||r.jumpPressed,jumpHeld:a.jumpHeld||r.jumpHeld,duckHeld:a.duckHeld||r.duckHeld,restartPressed:a.restartPressed||r.restartPressed})}this.game.step(a,1),this.accumulator-=this.STEP_MS}const s=this.accumulator/this.STEP_MS,i=this.aiController?.mode||"OFF",o=this.aiController?.getLastDecision()||null,n=this.aiController?.getEvolutionStats()||null;this.renderer.draw(this.game.state,s,i,o,n),this.neuralPanel?.update(i,o,n,e)};destroy(){this.stop(),document.removeEventListener("visibilitychange",this.handleVisibilityChange)}}class k{static memoryStore=new Map;static getItem(t){try{if(typeof window<"u"&&window.localStorage)return window.localStorage.getItem(t)}catch{}return this.memoryStore.get(t)??null}static setItem(t,e){try{if(typeof window<"u"&&window.localStorage){window.localStorage.setItem(t,e);return}}catch{}this.memoryStore.set(t,e)}static getNumber(t,e=0){const s=this.getItem(t);if(s===null)return e;const i=Number(s);return Number.isFinite(i)?i:e}static setNumber(t,e){this.setItem(t,String(e))}static getBoolean(t,e=!1){const s=this.getItem(t);return s===null?e:s==="true"}static setBoolean(t,e){this.setItem(t,e?"true":"false")}static getString(t,e=""){const s=this.getItem(t);return s!==null?s:e}static setString(t,e){this.setItem(t,e)}}class ie{isRetro;isMuted;reducedEffects;showHitboxes;theme;constructor(){this.isRetro=k.getBoolean("dino_retro",!1),this.isMuted=k.getBoolean("dino_muted",!1),this.reducedEffects=k.getBoolean("dino_reduced_effects",!1),this.showHitboxes=!1,this.theme=k.getString("dino_theme","light")||"light"}toggleTheme(){return this.theme=this.theme==="light"?"dark":"light",k.setString("dino_theme",this.theme),this.theme}toggleRetro(){return this.isRetro=!this.isRetro,k.setBoolean("dino_retro",this.isRetro),this.isRetro}toggleMute(){return this.isMuted=!this.isMuted,k.setBoolean("dino_muted",this.isMuted),this.isMuted}toggleReducedEffects(){return this.reducedEffects=!this.reducedEffects,k.setBoolean("dino_reduced_effects",this.reducedEffects),this.reducedEffects}toggleHitboxes(){return this.showHitboxes=!this.showHitboxes,this.showHitboxes}}class ne{ctx=null;masterGain=null;isMuted=!1;constructor(t=!1){this.isMuted=t}initContext(){if(typeof window>"u")return null;if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;if(!t)return null;this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=this.isMuted?0:.5,this.masterGain.connect(this.ctx.destination)}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(t){this.isMuted=t,this.masterGain&&this.ctx&&this.masterGain.gain.setValueAtTime(t?0:.5,this.ctx.currentTime)}playJump(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,s=t.createOscillator(),i=t.createGain();s.type="square",s.frequency.setValueAtTime(440,e),s.frequency.exponentialRampToValueAtTime(880,e+.09),i.gain.setValueAtTime(.15,e),i.gain.exponentialRampToValueAtTime(.001,e+.09),s.connect(i),i.connect(this.masterGain),s.start(e),s.stop(e+.095)}playMilestone(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,s=t.createOscillator(),i=t.createGain();s.type="square",s.frequency.setValueAtTime(880,e),i.gain.setValueAtTime(.12,e),i.gain.setValueAtTime(.12,e+.06),i.gain.exponentialRampToValueAtTime(.001,e+.07),s.connect(i),i.connect(this.masterGain),s.start(e),s.stop(e+.075);const o=e+.08,n=t.createOscillator(),a=t.createGain();n.type="square",n.frequency.setValueAtTime(1320,o),a.gain.setValueAtTime(.12,o),a.gain.setValueAtTime(.12,o+.06),a.gain.exponentialRampToValueAtTime(.001,o+.07),n.connect(a),a.connect(this.masterGain),n.start(o),n.stop(o+.075)}playCrash(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,s=t.createOscillator(),i=t.createGain();s.type="square",s.frequency.setValueAtTime(300,e),s.frequency.exponentialRampToValueAtTime(80,e+.22),i.gain.setValueAtTime(.2,e),i.gain.exponentialRampToValueAtTime(.001,e+.22),s.connect(i),i.connect(this.masterGain),s.start(e),s.stop(e+.23);const o=Math.floor(t.sampleRate*.12),n=t.createBuffer(1,o,t.sampleRate),a=n.getChannelData(0);for(let c=0;c<o;c++)a[c]=Math.random()*2-1;const r=t.createBufferSource();r.buffer=n;const h=t.createGain();h.gain.setValueAtTime(.15,e),h.gain.exponentialRampToValueAtTime(.001,e+.12),r.connect(h),h.connect(this.masterGain),r.start(e)}playLand(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,s=t.createOscillator(),i=t.createGain();s.type="sine",s.frequency.setValueAtTime(120,e),s.frequency.exponentialRampToValueAtTime(60,e+.06),i.gain.setValueAtTime(.15,e),i.gain.exponentialRampToValueAtTime(.001,e+.06),s.connect(i),i.connect(this.masterGain),s.start(e),s.stop(e+.065)}playNearMiss(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,s=t.createOscillator(),i=t.createGain();s.type="triangle",s.frequency.setValueAtTime(600,e),s.frequency.exponentialRampToValueAtTime(200,e+.08),i.gain.setValueAtTime(.08,e),i.gain.exponentialRampToValueAtTime(.001,e+.08),s.connect(i),i.connect(this.masterGain),s.start(e),s.stop(e+.085)}playHighScore(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=this.masterGain,s=[523.25,659.25,783.99],i=t.currentTime;s.forEach((o,n)=>{const a=i+n*.1,r=t.createOscillator(),h=t.createGain();r.type="sine",r.frequency.setValueAtTime(o,a),h.gain.setValueAtTime(.15,a),h.gain.exponentialRampToValueAtTime(.001,a+.12),r.connect(h),h.connect(e),r.start(a),r.stop(a+.13)})}}class oe{ctx=null;gainNode=null;noiseNode=null;filterNode=null;isMuted=!1;isRunning=!1;constructor(t=!1){this.isMuted=t}setMuted(t){this.isMuted=t,this.gainNode&&this.ctx&&this.gainNode.gain.setValueAtTime(t?0:.03,this.ctx.currentTime)}start(){if(!(this.isRunning||typeof window>"u"))try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.gainNode=this.ctx.createGain(),this.gainNode.gain.value=this.isMuted?0:.03,this.gainNode.connect(this.ctx.destination),this.filterNode=this.ctx.createBiquadFilter(),this.filterNode.type="lowpass",this.filterNode.frequency.value=400,this.filterNode.connect(this.gainNode);const e=this.ctx.sampleRate*2,s=this.ctx.createBuffer(1,e,this.ctx.sampleRate),i=s.getChannelData(0);let o=0;for(let n=0;n<e;n++){const a=Math.random()*2-1;i[n]=(o+.02*a)/1.02,o=i[n]}this.noiseNode=this.ctx.createBufferSource(),this.noiseNode.buffer=s,this.noiseNode.loop=!0,this.noiseNode.connect(this.filterNode),this.noiseNode.start(),this.isRunning=!0}catch{}}stop(){if(this.noiseNode){try{this.noiseNode.stop()}catch{}this.noiseNode.disconnect(),this.noiseNode=null}this.isRunning=!1}}class z{static getNearestObstacle(t){const e=t.trex,s=e.x+e.w;let i=null,o=1/0;for(const n of t.obstacles)if(n.x+n.w>e.x){const r=n.x-s;r<o&&(o=r,i=n)}return{obs:i,distance:o}}static evaluateNaive(t){const{obs:e,distance:s}=this.getNearestObstacle(t);if(!e)return{action:"NONE"};const i=t.speed,o=11*i,n=s>0&&s<o,a=n?"JUMP":"NONE",r=Math.min(1,Math.max(0,s/600)),h=i/20,c=n?1:0,u={inputs:[r,e.w/100,e.h/100,e.y/150,t.trex.y/100,t.trex.jumping?1:0,h],hidden:[n?.9:.1,.05,h,1-r],outputs:[c===0?.88:.12,c===1?.88:.12,0],logits:[c===0?2:-1,c===1?2:-1,-2],actionIndex:c,confidence:.88,w1:[[-1.1,0,0,-1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1.1,0,1,0]],w2:[[0,2,0],[0,0,0],[0,.5,0],[1,-.5,0]]};return{action:a,targetObs:e,distance:s,threshold:o,networkState:u}}static evaluateLinear(t){const{obs:e,distance:s}=this.getNearestObstacle(t);if(!e)return{action:"NONE"};const i=t.speed,o=14.5*i-12.9;let n="NONE";e.type==="PTERODACTYL"&&e.y===75?s<i*16&&s>-e.w&&(n="DUCK"):e.type==="PTERODACTYL"&&e.y===50?n="NONE":s>0&&s<o&&(n="JUMP");const a=Math.min(1,Math.max(0,s/600)),r=i/20,h=n==="JUMP"?1:n==="DUCK"?2:0,c={inputs:[a,e.w/100,e.h/100,e.y/150,t.trex.y/100,t.trex.jumping?1:0,r],hidden:[n==="JUMP"?.95:.05,n==="DUCK"?.95:.05,r,1-a],outputs:[h===0?.94:.03,h===1?.97:.02,h===2?.95:.02],logits:[h===0?3:-1,h===1?3.5:-1,h===2?3.2:-1],actionIndex:h,confidence:.97,w1:[[-3.1,0,0,-1],[0,0,0,0],[0,0,0,0],[0,1.8,0,0],[0,0,0,0],[0,0,0,0],[1.8,0,1,0]],w2:[[0,2.8,0],[0,0,3],[0,.6,0],[1.5,-.6,-.6]]};return{action:n,targetObs:e,distance:s,threshold:o,networkState:c}}}class Q{inputSize=7;hiddenSize=8;outputSize=3;w1;b1;w2;b2;constructor(t){t?(this.w1=t.w1.map(e=>[...e]),this.b1=[...t.b1],this.w2=t.w2.map(e=>[...e]),this.b2=[...t.b2]):(this.w1=this.createDefaultW1(),this.b1=new Array(this.hiddenSize).fill(0),this.w2=this.createDefaultW2(),this.b2=[-.2,.5,.2])}createDefaultW1(){return[[-2.8,-3.2,1.5,-4,0,0,-1.5,2],[.6,.8,.2,.4,0,0,0,0],[.5,.6,0,.5,0,0,0,0],[0,0,-3.5,0,2.5,0,0,0],[0,0,0,0,0,-2,0,0],[0,0,0,0,0,-1,0,0],[1.8,2.2,0,2.5,0,0,1.2,0]]}createDefaultW2(){return[[-.5,2.8,-1],[-.4,2.6,-1],[-.2,-2,3.2],[-.5,2.5,-.8],[-.1,-1.5,2.8],[1.5,-1,-1],[-.2,1.2,-.5],[1.2,-.8,-.8]]}static extractFeatures(t){const{obs:e,distance:s}=z.getNearestObstacle(t),i=t.trex,o=t.speed,n=e?Math.min(1,Math.max(0,s/600)):1,a=e?e.w/100:0,r=e?e.h/100:0,h=e?e.y/150:0,c=i.y/100,u=i.jumping?1:0,p=o/20;return{features:[n,a,r,h,c,u,p],obs:e,distance:s}}predict(t){const e=new Array(this.hiddenSize).fill(0);for(let c=0;c<this.hiddenSize;c++){let u=this.b1[c];for(let p=0;p<this.inputSize;p++)u+=t[p]*this.w1[p][c];e[c]=Math.max(0,u)}const s=new Array(this.outputSize).fill(0);for(let c=0;c<this.outputSize;c++){let u=this.b2[c];for(let p=0;p<this.hiddenSize;p++)u+=e[p]*this.w2[p][c];s[c]=u}const i=Math.max(...s),o=s.map(c=>Math.exp(c-i)),n=o.reduce((c,u)=>c+u,0),a=o.map(c=>c/n);let r=0,h=-1/0;for(let c=0;c<this.outputSize;c++)s[c]>h&&(h=s[c],r=c);return{inputs:t,hidden:e,outputs:a,logits:s,actionIndex:r,confidence:a[r],w1:this.w1,w2:this.w2}}evaluate(t){const{features:e,obs:s,distance:i}=Q.extractFeatures(t),o=this.predict(e);let n="NONE";return o.actionIndex===1?n="JUMP":o.actionIndex===2&&(n="DUCK"),{action:n,targetObs:s||void 0,distance:s?i:void 0,features:e,confidence:o.confidence,networkState:o}}clone(){return new Q({w1:this.w1.map(t=>[...t]),b1:[...this.b1],w2:this.w2.map(t=>[...t]),b2:[...this.b2]})}mutate(t=.1,e=.2){const s=()=>{let i=0,o=0;for(;i===0;)i=Math.random();for(;o===0;)o=Math.random();return Math.sqrt(-2*Math.log(i))*Math.cos(2*Math.PI*o)};for(let i=0;i<this.inputSize;i++)for(let o=0;o<this.hiddenSize;o++)Math.random()<t&&(this.w1[i][o]+=s()*e);for(let i=0;i<this.hiddenSize;i++)Math.random()<t&&(this.b1[i]+=s()*e);for(let i=0;i<this.hiddenSize;i++)for(let o=0;o<this.outputSize;o++)Math.random()<t&&(this.w2[i][o]+=s()*e);for(let i=0;i<this.outputSize;i++)Math.random()<t&&(this.b2[i]+=s()*e)}}class ae{populationSize=10;generationFrames=600;population=[];generation=1;frameInGen=0;bestFitness=0;bestAgent=null;constructor(){this.initPopulation()}initPopulation(){const t=["#00ffcc","#ff0077","#ffcc00","#0099ff","#9933ff","#ff6600","#33cc33","#ff3399","#00e5ff","#ffea00"];this.population=[];for(let e=0;e<this.populationSize;e++){const s=new Q;e>0&&s.mutate(.4,.5),this.population.push({id:e+1,net:s,fitness:0,crashes:0,isGhost:!1,color:t[e%t.length]})}}step(t,e){this.frameInGen++;for(const i of this.population)i.isGhost?i.fitness+=.2:i.fitness+=1,e&&(i.crashes+=1,i.isGhost=!0,i.fitness=Math.max(0,i.fitness-50));return this.frameInGen>=this.generationFrames&&this.nextGeneration(),this.getBestAgent().net.evaluate(t)}nextGeneration(){this.population.sort((i,o)=>o.fitness-i.fitness),this.bestAgent=this.population[0],this.bestFitness=Math.max(this.bestFitness,this.bestAgent.fitness);const t=this.population[0],e=this.population[1],s=[];s.push({id:1,net:t.net.clone(),fitness:0,crashes:0,isGhost:!1,color:t.color}),s.push({id:2,net:e.net.clone(),fitness:0,crashes:0,isGhost:!1,color:e.color});for(let i=2;i<this.populationSize;i++){const n=(i%2===0?t:e).net.clone(),a=i>7?.4:.15;n.mutate(.2,a),s.push({id:i+1,net:n,fitness:0,crashes:0,isGhost:!1,color:this.population[i].color})}this.population=s,this.generation++,this.frameInGen=0}getBestAgent(){return this.population.reduce((t,e)=>e.fitness>t.fitness?e:t,this.population[0])}getStats(){const t=this.population.filter(s=>!s.isGhost).length,e=this.population.reduce((s,i)=>s+i.crashes,0);return{generation:this.generation,aliveCount:t,totalPopulation:this.populationSize,bestFitness:Math.round(this.bestFitness),crashes:e}}reset(){this.generation=1,this.frameInGen=0,this.bestFitness=0,this.initPopulation()}}class re{mode="OFF";ann;evolution;lastDecision=null;wasCrashed=!1;constructor(){this.ann=new Q,this.evolution=new ae}setMode(t){this.mode=t,t==="EVOLUTION"&&this.evolution.reset()}cycleMode(){const t=["OFF","NAIVE","LINEAR","ANN","EVOLUTION"],e=t.indexOf(this.mode),s=t[(e+1)%t.length];return this.setMode(s),s}update(t){if(this.mode==="OFF")return this.lastDecision=null,null;const e=t.phase==="CRASHED"&&!this.wasCrashed;this.wasCrashed=t.phase==="CRASHED";let s;switch(this.mode){case"NAIVE":s=z.evaluateNaive(t);break;case"LINEAR":s=z.evaluateLinear(t);break;case"ANN":s=this.ann.evaluate(t);break;case"EVOLUTION":s=this.evolution.step(t,e);break;default:s={action:"NONE"}}if(this.lastDecision=s,t.phase==="CRASHED")return{jumpPressed:!1,jumpHeld:!1,duckHeld:!1,restartPressed:!0};if(t.phase==="READY")return{jumpPressed:!0,jumpHeld:!0,duckHeld:!1,restartPressed:!1};const i=s.action==="JUMP",o=s.action==="DUCK";return{jumpPressed:i&&!t.trex.jumping,jumpHeld:i,duckHeld:o,restartPressed:!1}}getLastDecision(){return this.lastDecision}getEvolutionStats(){return this.mode==="EVOLUTION"?this.evolution.getStats():null}}class le{panelEl=null;canvas=null;ctx=null;pulseTime=0;isVisible=!1;policyDescEl=null;distValEl=null;speedValEl=null;benchValEl=null;tabsContainer=null;onModeSelect;inputNodes=[{label:"distance",key:"dist"},{label:"obs_width",key:"w"},{label:"obs_height",key:"h"},{label:"elevation",key:"elev"},{label:"dino_height",key:"y"},{label:"dino_vel",key:"vy"},{label:"speed",key:"spd"}];outputNodes=[{label:"RUN",action:"NONE"},{label:"JUMP",action:"JUMP"},{label:"DUCK",action:"DUCK"}];constructor(){this.createDom()}createDom(){let t=document.getElementById("ai-neural-panel");if(!t){t=document.createElement("section"),t.id="ai-neural-panel";const e=document.querySelector(".cabinet-chassis");e&&e.parentElement?e.parentElement.appendChild(t):document.body.appendChild(t)}if(t.className="neural-deck is-hidden",t.innerHTML=`
      <div class="deck-header">
        <div class="deck-title-group">
          <span class="deck-indicator-dot"></span>
          <div class="deck-badge">NPU // AGENT COPILOT</div>
          <span class="deck-title">SYNAPTIC INFERENCE CHAMBER</span>
        </div>
        <div class="deck-mode-tabs" role="tablist" aria-label="AI Policy Selector">
          <button class="deck-tab" data-mode="NAIVE">11&times;S (71%)</button>
          <button class="deck-tab" data-mode="LINEAR">3-BYTE (100%)</button>
          <button class="deck-tab" data-mode="ANN">NEURAL NET</button>
          <button class="deck-tab" data-mode="EVOLUTION">EVOLUTION</button>
          <button class="deck-tab" data-mode="OFF">STANDBY</button>
        </div>
      </div>

      <div class="deck-policy-banner" id="deck-policy-desc">
        <span class="policy-formula">Loading agent telemetry...</span>
      </div>

      <div class="deck-telemetry-row">
        <div class="telemetry-card">
          <div class="telemetry-label">PERCEPTION DIST</div>
          <div class="telemetry-val" id="tele-dist">--</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-label">DINO SPEED</div>
          <div class="telemetry-val" id="tele-speed">--</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-label">INFERENCE TIME</div>
          <div class="telemetry-val"><span class="highlight">&lt; 0.1</span> ms</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-label">THE REEL BENCHMARK</div>
          <div class="telemetry-val" id="tele-bench">--</div>
        </div>
      </div>

      <div class="neural-deck-content">
        <canvas id="neural-canvas" width="640" height="200"></canvas>
      </div>
    `,this.panelEl=t,this.canvas=t.querySelector("#neural-canvas"),this.policyDescEl=t.querySelector("#deck-policy-desc"),this.distValEl=t.querySelector("#tele-dist"),this.speedValEl=t.querySelector("#tele-speed"),this.benchValEl=t.querySelector("#tele-bench"),this.tabsContainer=t.querySelector(".deck-mode-tabs"),this.tabsContainer?.addEventListener("click",e=>{const s=e.target.closest(".deck-tab");if(!s)return;const i=s.getAttribute("data-mode");i&&this.onModeSelect&&this.onModeSelect(i)}),this.canvas){this.ctx=this.canvas.getContext("2d");const e=window.devicePixelRatio||1;this.canvas.width=640*e,this.canvas.height=200*e,this.ctx?.scale(e,e)}}update(t,e,s,i){const o=t!=="OFF";if(o!==this.isVisible&&(this.isVisible=o,this.panelEl&&(this.panelEl.classList.toggle("is-hidden",!this.isVisible),this.panelEl.classList.toggle("is-visible",this.isVisible))),this.tabsContainer&&this.tabsContainer.querySelectorAll(".deck-tab").forEach(a=>{const r=a.getAttribute("data-mode");a.classList.toggle("is-active",r===t)}),this.policyDescEl){if(t==="NAIVE")this.policyDescEl.innerHTML=`
          <span class="badge-naive">STAGE 1 &middot; NAIVE RULE</span>
          <span class="policy-formula">if (distance &lt; 11 * speed) jump()</span>
          <span class="policy-note">Reel result: <strong>71%</strong> cleared &bull; Fails against high speeds and multi-cactus clusters.</span>
        `;else if(t==="LINEAR")this.policyDescEl.innerHTML=`
          <span class="badge-linear">STAGE 3 &middot; 3-BYTE MODEL</span>
          <span class="policy-formula">if (distance &lt; 14.5 * speed - 12.9) jump()</span>
          <span class="policy-note">Reel result: <strong>100%</strong> cleared &bull; 30,000 runs, 0 crashes &bull; 18 bits = 3 Bytes total memory.</span>
        `;else if(t==="ANN")this.policyDescEl.innerHTML=`
          <span class="badge-ann">STAGE 2 &middot; NEURAL NETWORK</span>
          <span class="policy-formula">7 Inputs &rarr; 8 Hidden (ReLU) &rarr; 3 Outputs (Softmax)</span>
          <span class="policy-note">Autonomous flight &amp; duck dynamics &bull; 100/100 levels cleared &bull; 88 parameters.</span>
        `;else if(t==="EVOLUTION"){const n=s?.generation??1,a=Math.round(s?.bestFitness??0),r=s?.aliveCount??1,h=s?.totalPopulation??20;this.policyDescEl.innerHTML=`
          <span class="badge-evo">NEUROEVOLUTION &middot; GHOST MODE</span>
          <span class="policy-formula">Gen ${n} &bull; Peak Fitness ${a} &bull; Active: ${r}/${h}</span>
          <span class="policy-note">Non-fatal collision trick &bull; Evolves weights continuously without resetting runs.</span>
        `}}if(this.distValEl&&(e?.distance!==void 0&&e.distance>=0&&e.distance<999?this.distValEl.textContent=`${Math.round(e.distance)} px`:e?.distance!==void 0&&e.distance<0?this.distValEl.textContent="CLEARED":this.distValEl.textContent="SEARCHING"),this.speedValEl){const n=e?.networkState?.inputs?.[6]!==void 0?(e.networkState.inputs[6]*13).toFixed(1):e?.features?.[6]!==void 0?e.features[6].toFixed(1):"6.0";this.speedValEl.textContent=`${n} px/f`}this.benchValEl&&(t==="NAIVE"?this.benchValEl.textContent="71 / 100 (FAIL)":t==="LINEAR"?this.benchValEl.textContent="100 / 100 (PERFECT)":t==="ANN"?this.benchValEl.textContent="100 / 100 (PASSED)":t==="EVOLUTION"?this.benchValEl.textContent="EVOLVING":this.benchValEl.textContent="--"),!(!this.isVisible||!this.ctx||!this.canvas)&&(this.pulseTime+=i*.0025,e?.networkState&&this.drawDiagram(e.networkState))}drawDiagram(t){const e=this.ctx;if(!e)return;const s=640,i=200;e.clearRect(0,0,s,i);const o=100,n=95,a=20,h=i-a-26,c=s-o-n,u=o,p=o+c*.52,w=s-n,v=t.inputs.length,M=t.hidden.length,b=t.outputs.length,S=this.getYPositions(a+6,h-12,v),E=this.getYPositions(a+4,h-8,M),R=this.getYPositions(a+24,h-48,b);for(let l=0;l<v;l++){const f=S[l],g=Math.min(1,Math.max(0,t.inputs[l]));for(let m=0;m<M;m++){const x=E[m],T=t.w1[l]?t.w1[l][m]:0,A=Math.abs(T)*(.3+g*.7),L=u+(p-u)*.42,B=u+(p-u)*.58;e.beginPath();const P=Math.min(.7,.04+A*.18);if(e.strokeStyle=T>=0?`rgba(245, 158, 11, ${P})`:`rgba(236, 72, 153, ${P*.8})`,e.lineWidth=Math.min(1.8,.4+A*.35),e.moveTo(u,f),e.bezierCurveTo(L,f,B,x,p,x),e.stroke(),A>.45){const U=(this.pulseTime*1.5+(l*.13+m*.07))%1,X=this.bezierPoint(u,L,B,p,U),q=this.bezierPoint(f,f,x,x,U);e.beginPath(),e.arc(X,q,1.2,0,Math.PI*2),e.fillStyle="#fef08a",e.fill()}}}for(let l=0;l<M;l++){const f=E[l],g=Math.min(1,t.hidden[l]);for(let m=0;m<b;m++){const x=R[m],T=m===t.actionIndex,C=t.w2[l]?t.w2[l][m]:0,A=Math.abs(C)*(.2+g*.8),L=p+(w-p)*.42,B=p+(w-p)*.58;e.beginPath();const P=Math.min(.85,(T?.3:.04)+A*.22);e.strokeStyle=T?`rgba(52, 211, 153, ${P})`:`rgba(245, 158, 11, ${P*.6})`,e.lineWidth=T?1.6:.6,e.moveTo(p,f),e.bezierCurveTo(L,f,B,x,w,x),e.stroke()}}for(let l=0;l<v;l++){const f=S[l],g=Math.min(1,Math.max(0,t.inputs[l]));e.fillStyle="#cbd5e1",e.font="500 10.5px ui-monospace, SF Mono, Menlo, monospace",e.textAlign="right",e.fillText(this.inputNodes[l].label,u-14,f+3.5),e.beginPath(),e.arc(u,f,8.5,0,Math.PI*2),e.fillStyle="#e2e8f0",e.fill(),e.lineWidth=1,e.strokeStyle="#94a3b8",e.stroke();const m=Math.max(2.5,3+g*3.5);e.beginPath(),e.arc(u,f,m,0,Math.PI*2),e.fillStyle="#a3e635",e.shadowColor="#a3e635",e.shadowBlur=8*g+2,e.fill(),e.shadowBlur=0}for(let l=0;l<M;l++){const f=E[l],g=Math.min(1,Math.max(0,t.hidden[l]));e.beginPath(),e.arc(p,f,6.5,0,Math.PI*2),e.fillStyle="#e2e8f0",e.fill(),e.lineWidth=1,e.strokeStyle="#94a3b8",e.stroke();const m=Math.max(2,2.2+g*2.8);e.beginPath(),e.arc(p,f,m,0,Math.PI*2),e.fillStyle="#f59e0b",e.shadowColor="#f59e0b",e.shadowBlur=6*g+1,e.fill(),e.shadowBlur=0}for(let l=0;l<b;l++){const f=R[l],g=l===t.actionIndex,m=t.outputs[l]||0;e.beginPath(),e.arc(w,f,g?9.5:7.5,0,Math.PI*2),e.fillStyle=g?"#f8fafc":"#e2e8f0",e.fill(),e.lineWidth=g?2:1,e.strokeStyle=g?"#10b981":"#94a3b8",e.stroke();const x=Math.max(2.5,2.8+m*3.5);e.beginPath(),e.arc(w,f,x,0,Math.PI*2),e.fillStyle=g?"#10b981":"#f59e0b",e.shadowColor=g?"#10b981":"#f59e0b",e.shadowBlur=g?12:3,e.fill(),e.shadowBlur=0,e.fillStyle=g?"#34d399":"#94a3b8",e.font=g?"700 11px ui-monospace, SF Mono, Menlo, monospace":"500 10.5px ui-monospace, SF Mono, Menlo, monospace",e.textAlign="left";const T=Math.round(m*100);e.fillText(`${this.outputNodes[l].label} ${T}%`,w+16,f+3.5)}e.fillStyle="#64748b",e.font="500 11px ui-monospace, SF Mono, Menlo, monospace",e.textAlign="center";const G=".".repeat(1+Math.floor(this.pulseTime*2)%3);e.fillText(`thinking${G}`,p,i-8)}getYPositions(t,e,s){const i=e/(s-1||1),o=[];for(let n=0;n<s;n++)o.push(t+n*i);return o}bezierPoint(t,e,s,i,o){const n=1-o;return n*n*n*t+3*n*n*o*e+3*n*o*o*s+o*o*o*i}}function W(){const d=document.getElementById("game");if(!d)throw new Error("Canvas element #game not found");const t=new ie,e=new ne(t.isMuted),s=new oe(t.isMuted),i=new rt(d),o=new te(d,i),n=new ee(window),a=new re,r=new le,h=k.getNumber("dino_high_score",0),c=new at(Date.now(),h);o.isRetro=t.isRetro,o.reducedEffects=t.reducedEffects,o.showHitboxes=t.showHitboxes;const u=l=>{document.body.classList.toggle("theme-dark",l==="dark"),document.body.classList.toggle("theme-light",l==="light"),o.overlay.updateButtons(t.isMuted,t.isRetro,a.mode,l)};u(t.theme);const p=()=>{const l=t.toggleTheme();u(l)};n.onThemeToggle=p,o.overlay.onThemeClick=p;let w=!1;const v=()=>{w||(w=!0,s.start())};window.addEventListener("keydown",v,{once:!0}),window.addEventListener("touchstart",v,{once:!0}),window.addEventListener("click",v,{once:!0});const M=()=>{const l=c.state.events;for(const f of l)f==="jump"?e.playJump():f==="land"?e.playLand():f==="crash"?(e.playCrash(),k.setNumber("dino_high_score",c.state.highScore)):f==="milestone"?e.playMilestone():f==="nearMiss"?e.playNearMiss():f==="highScore"&&e.playHighScore()},b=()=>{const l=t.toggleMute();e.setMuted(l),s.setMuted(l),o.overlay.updateButtons(l,t.isRetro,a.mode,t.theme)};n.onMuteToggle=b,o.overlay.onMuteClick=b;const S=()=>{const l=t.toggleRetro();o.isRetro=l,o.overlay.updateButtons(t.isMuted,l,a.mode,t.theme)};n.onRetroToggle=S,o.overlay.onRetroClick=S;const E=()=>{const l=a.cycleMode();o.overlay.updateButtons(t.isMuted,t.isRetro,l,t.theme)};n.onAIToggle=E,o.overlay.onAIClick=E,r.onModeSelect=l=>{a.setMode(l),o.overlay.updateButtons(t.isMuted,t.isRetro,l,t.theme)},n.onHitboxToggle=()=>{o.showHitboxes=t.toggleHitboxes()},n.onKonamiCode=()=>{o.expressions.hasSunglasses=!o.expressions.hasSunglasses,console.log("Easter egg unlocked: Dino Sunglasses!")};const R=new se(c,n,o,a,r),G=c.step.bind(c);c.step=(l,f=1)=>{G(l,f),M()},R.start(),console.log("Dino Run engine initialized with biomes, skins, ambient audio, and AI Auto-Pilot.")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",W):W();
//# sourceMappingURL=index-DrW7cX4v.js.map
