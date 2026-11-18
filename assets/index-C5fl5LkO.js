(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();const u={WIDTH:600,FPS:60,SPEED:6,MAX_SPEED:13,ACCELERATION:.001,CLEAR_TIME:3e3,GAP_COEFFICIENT:.6,MAX_GAP_COEFFICIENT:1.5,MAX_OBSTACLE_LENGTH:3,MAX_OBSTACLE_DUPLICATION:2,GAMEOVER_CLEAR_TIME:750,GRAVITY:.6,INVERT_DISTANCE:700,MAX_CLOUDS:6,CLOUD_FREQUENCY:.5},d={WIDTH:44,HEIGHT:47,WIDTH_DUCK:59,HEIGHT_DUCK:25,START_X_POS:50,GROUND_Y_POS:93,INITIAL_JUMP_VELOCITY:-10,DROP_VELOCITY:-5,MIN_JUMP_HEIGHT:30,MAX_JUMP_HEIGHT:30,SPEED_DROP_COEFFICIENT:3,INTRO_DURATION:1500},S={COEFFICIENT:.025,MAX_SCORE:99999,FLASH_DURATION:250,FLASH_ITERATIONS:3},M={CLOUD_WIDTH:46,CLOUD_MIN_Y:30,CLOUD_MAX_Y:71,CLOUD_MIN_GAP:100,CLOUD_MAX_GAP:400,CLOUD_SPEED:.2},G=[{x:22,y:0,w:17,h:16},{x:1,y:18,w:30,h:9},{x:10,y:35,w:14,h:8},{x:1,y:24,w:29,h:5},{x:5,y:30,w:21,h:4},{x:9,y:34,w:15,h:4}],R=[{x:1,y:18,w:55,h:25}],B={CACTUS_SMALL:{type:"CACTUS_SMALL",width:17,height:35,yPos:105,minGap:120,minSpeed:0,multipleSpeed:4,frames:1,collisionBoxes:[{x:0,y:7,w:5,h:27},{x:4,y:0,w:6,h:34},{x:10,y:4,w:7,h:14}]},CACTUS_LARGE:{type:"CACTUS_LARGE",width:25,height:50,yPos:90,minGap:120,minSpeed:0,multipleSpeed:7,frames:1,collisionBoxes:[{x:0,y:12,w:7,h:38},{x:8,y:0,w:7,h:49},{x:13,y:10,w:10,h:38}]},PTERODACTYL:{type:"PTERODACTYL",width:46,height:40,yPos:100,yPosList:[100,75,50],minGap:150,minSpeed:8.5,multipleSpeed:999,frames:2,frameRate:6,speedOffset:.8,collisionBoxes:[{x:15,y:15,w:16,h:5},{x:18,y:21,w:24,h:6},{x:2,y:14,w:4,h:3},{x:6,y:10,w:4,h:7},{x:10,y:8,w:6,h:9}]}};class b{s;constructor(t=1337){this.s=t|0}setSeed(t){this.s=t|0}next(){let t=this.s+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}int(t,e){return Math.floor(this.next()*(e-t+1))+t}}class Q{x=d.START_X_POS;y=d.GROUND_Y_POS;w=d.WIDTH;h=d.HEIGHT;ducking=!1;jumping=!1;jumpVelocity=0;reachedMinHeight=!1;speedDrop=!1;frame=0;animTimer=0;isAirDuckPending=!1;constructor(){this.reset()}reset(){this.x=d.START_X_POS,this.y=d.GROUND_Y_POS,this.w=d.WIDTH,this.h=d.HEIGHT,this.ducking=!1,this.jumping=!1,this.jumpVelocity=0,this.reachedMinHeight=!1,this.speedDrop=!1,this.frame=0,this.animTimer=0,this.isAirDuckPending=!1}startJump(t){return this.jumping||this.ducking?!1:(this.jumping=!0,this.jumpVelocity=d.INITIAL_JUMP_VELOCITY-t/10,this.reachedMinHeight=!1,this.speedDrop=!1,!0)}updateJump(t=1){if(!this.jumping)return!1;this.speedDrop?this.y+=Math.round(this.jumpVelocity*d.SPEED_DROP_COEFFICIENT*t):this.y+=Math.round(this.jumpVelocity*t),this.jumpVelocity+=u.GRAVITY*t;const e=d.GROUND_Y_POS-d.MIN_JUMP_HEIGHT;return(this.y<e||this.speedDrop)&&(this.reachedMinHeight=!0),(this.y<d.MAX_JUMP_HEIGHT||this.speedDrop)&&this.endJump(),this.y>d.GROUND_Y_POS?(this.land(),!0):!1}endJump(){this.reachedMinHeight&&this.jumpVelocity<d.DROP_VELOCITY&&(this.jumpVelocity=d.DROP_VELOCITY)}land(){this.y=d.GROUND_Y_POS,this.jumping=!1,this.jumpVelocity=0,this.speedDrop=!1,this.reachedMinHeight=!1,this.isAirDuckPending?(this.isAirDuckPending=!1,this.setDuck(!0)):this.ducking?(this.y=d.GROUND_Y_POS+(d.HEIGHT-d.HEIGHT_DUCK),this.w=d.WIDTH_DUCK,this.h=d.HEIGHT_DUCK):(this.w=d.WIDTH,this.h=d.HEIGHT)}setSpeedDrop(t){this.speedDrop=t,t&&this.jumping&&(this.jumpVelocity=1)}setDuck(t){if(this.jumping){this.setSpeedDrop(t),this.isAirDuckPending=t;return}this.isAirDuckPending=!1,t?(this.ducking=!0,this.w=d.WIDTH_DUCK,this.h=d.HEIGHT_DUCK,this.y=d.GROUND_Y_POS+(d.HEIGHT-d.HEIGHT_DUCK)):(this.ducking=!1,this.w=d.WIDTH,this.h=d.HEIGHT,this.y=d.GROUND_Y_POS)}updateAnim(t=1){if(this.jumping){this.frame=0;return}this.animTimer+=t,this.animTimer>=5&&(this.animTimer=0,this.frame=(this.frame+1)%2)}getState(){return{x:this.x,y:this.y,w:this.w,h:this.h,ducking:this.ducking,jumping:this.jumping,jumpVelocity:this.jumpVelocity,reachedMinHeight:this.reachedMinHeight,speedDrop:this.speedDrop,frame:this.frame,animTimer:this.animTimer}}}class T{type;x;y;w;h;size;gap;speedOffset;frame;animTimer;followingObstacleCreated;collisionBoxes;constructor(t,e,i,s){if(this.type=t.type,this.size=e,this.w=t.width*e,this.h=t.height,this.x=u.WIDTH,this.followingObstacleCreated=!1,this.frame=0,this.animTimer=0,this.type==="PTERODACTYL"){const o=t.yPosList??[100,75,50],n=s.int(0,o.length-1);this.y=o[n];const r=s.next()<.5?-1:1;this.speedOffset=r*(t.speedOffset??.8)}else this.y=t.yPos,this.speedOffset=0;this.gap=T.getGap(this.w,t.minGap,u.GAP_COEFFICIENT,i,s),this.collisionBoxes=T.createCollisionBoxes(t,this.size,this.w)}static getGap(t,e,i,s,o){const n=Math.round(t*s+e*i),r=Math.round(n*u.MAX_GAP_COEFFICIENT);return o.int(n,r)}static createCollisionBoxes(t,e,i){const s=t.collisionBoxes.map(o=>({...o}));return e>1&&s.length===3&&(s[1].w=i-s[0].w-s[2].w,s[2].x=i-s[2].w),s}static create(t,e,i){const s=B[t];let o=i.int(1,u.MAX_OBSTACLE_LENGTH);return o>1&&s.multipleSpeed>e&&(o=1),new T(s,o,e,i)}isVisible(){return this.x+this.w>0}update(t,e=1){const i=t+this.speedOffset;this.x-=Math.floor(i*e),this.type==="PTERODACTYL"&&(this.animTimer+=e,this.animTimer>=10&&(this.animTimer=0,this.frame=(this.frame+1)%2))}getState(){return{type:this.type,x:this.x,y:this.y,w:this.w,h:this.h,size:this.size,gap:this.gap,speedOffset:this.speedOffset,frame:this.frame,animTimer:this.animTimer,followingObstacleCreated:this.followingObstacleCreated,collisionBoxes:this.collisionBoxes}}}class P{x=u.WIDTH;y;gap;constructor(t){this.y=t.int(M.CLOUD_MIN_Y,M.CLOUD_MAX_Y),this.gap=t.int(M.CLOUD_MIN_GAP,M.CLOUD_MAX_GAP)}update(t=1){this.x-=M.CLOUD_SPEED*t}isVisible(){return this.x+M.CLOUD_WIDTH>0}}class I{groundOffset=0;clouds=[];obstacles=[];obstacleHistory=[];runningTimeMs=0;rng;constructor(t){this.rng=t,this.reset()}reset(){this.groundOffset=0,this.clouds=[],this.obstacles=[],this.obstacleHistory=[],this.runningTimeMs=0}update(t,e=1){this.runningTimeMs+=e*(1e3/u.FPS),this.groundOffset=(this.groundOffset+Math.floor(t*e))%u.WIDTH,this.updateClouds(e),this.updateObstacles(t,e)}updateClouds(t){for(let e=this.clouds.length-1;e>=0;e--)this.clouds[e].update(t),this.clouds[e].isVisible()||this.clouds.splice(e,1);if(this.clouds.length<u.MAX_CLOUDS){const e=this.clouds[this.clouds.length-1];(!e||u.WIDTH-e.x>e.gap&&this.rng.next()>u.CLOUD_FREQUENCY)&&this.clouds.push(new P(this.rng))}}updateObstacles(t,e){for(let i=this.obstacles.length-1;i>=0;i--)this.obstacles[i].update(t,e),this.obstacles[i].isVisible()||this.obstacles.splice(i,1);if(!(this.runningTimeMs<u.CLEAR_TIME))if(this.obstacles.length===0)this.addNewObstacle(t);else{const i=this.obstacles[this.obstacles.length-1];!i.followingObstacleCreated&&i.isVisible()&&i.x+i.w+i.gap<u.WIDTH&&(this.addNewObstacle(t),i.followingObstacleCreated=!0)}}addNewObstacle(t){const e=[],i=["CACTUS_SMALL","CACTUS_LARGE","PTERODACTYL"];for(const n of i)B[n].minSpeed>t||this.isDuplicateType(n)||e.push(n);e.length===0&&e.push("CACTUS_SMALL");const s=e[this.rng.int(0,e.length-1)],o=T.create(s,t,this.rng);this.obstacles.push(o),this.obstacleHistory.push(s)}isDuplicateType(t){const e=this.obstacleHistory.length;if(e<u.MAX_OBSTACLE_DUPLICATION)return!1;for(let i=1;i<=u.MAX_OBSTACLE_DUPLICATION;i++)if(this.obstacleHistory[e-i]!==t)return!1;return!0}getObstacleStates(){return this.obstacles.map(t=>t.getState())}getCloudStates(){return this.clouds.map(t=>({x:t.x,y:t.y,gap:t.gap}))}}class O{distance=0;score=0;highScore=0;isFlashing=!1;flashIterations=0;flashTimerMs=0;lastMilestoneScore=0;constructor(t=0){this.highScore=t,this.reset()}reset(){this.distance=0,this.score=0,this.isFlashing=!1,this.flashIterations=0,this.flashTimerMs=0,this.lastMilestoneScore=0}setHighScore(t){this.highScore=Math.max(this.highScore,t)}update(t,e=1,i=1e3/60){let s=!1,o=!1;this.distance+=t*e;const n=Math.min(Math.round(this.distance*S.COEFFICIENT),S.MAX_SCORE);return n>0&&Math.floor(n/100)>Math.floor(this.lastMilestoneScore/100)&&(s=!0,this.lastMilestoneScore=n,this.isFlashing=!0,this.flashIterations=0,this.flashTimerMs=0),n>this.highScore&&this.highScore>0&&this.score<=this.highScore&&(o=!0),this.score=n,this.isFlashing&&(this.flashTimerMs+=e*i,this.flashTimerMs>=S.FLASH_DURATION&&(this.flashTimerMs-=S.FLASH_DURATION,this.flashIterations++,this.flashIterations>=S.FLASH_ITERATIONS*2&&(this.isFlashing=!1,this.flashIterations=0,this.flashTimerMs=0))),{milestoneAchieved:s,newHighScore:o}}onCrash(){let t=!1;return this.score>this.highScore&&(this.highScore=this.score,t=!0),t}}class H{isNight=!1;nightFade=0;moonPhase=0;lastInvertScore=0;constructor(){this.reset()}reset(){this.isNight=!1,this.nightFade=0,this.moonPhase=0,this.lastInvertScore=0}update(t,e=1,i=1e3/60){let s=!1,o=!1;t>0&&Math.floor(t/u.INVERT_DISTANCE)>Math.floor(this.lastInvertScore/u.INVERT_DISTANCE)&&(this.isNight=!this.isNight,s=!0,o=!0,this.lastInvertScore=t,this.isNight&&(this.moonPhase=(this.moonPhase+1)%7));const n=this.isNight?1:0,r=e*i/1e3;return this.nightFade<n?this.nightFade=Math.min(n,this.nightFade+r):this.nightFade>n&&(this.nightFade=Math.max(n,this.nightFade-r)),{inverted:s,biomeChanged:o}}}function C(l,t){return l.x<t.x+t.w&&l.x+l.w>t.x&&l.y<t.y+t.h&&l.y+l.h>t.y}function k(l,t){const e={x:l.x+1,y:l.y+1,w:l.w-2,h:l.h-2},i={x:t.x+1,y:t.y+1,w:t.w-2,h:t.h-2};if(!C(e,i))return!1;const s=l.ducking?R:G,o=t.collisionBoxes;for(let n=0;n<s.length;n++){const r=s[n],a={x:l.x+r.x,y:l.y+r.y,w:r.w,h:r.h};for(let h=0;h<o.length;h++){const c=o[h],p={x:t.x+c.x,y:t.y+c.y,w:c.w,h:c.h};if(C(a,p))return!0}}return!1}function N(l,t,e=6){if(k(l,t))return!1;const i={x:l.x-e,y:l.y-e,w:l.w+e*2,h:l.h+e*2},s={x:t.x,y:t.y,w:t.w,h:t.h};return C(i,s)}class _{phase="READY";speed=u.SPEED;elapsedMs=0;crashTimerMs=0;introTimerMs=0;trex;horizon;scoreManager;dayNightManager;rng;currentEvents=[];constructor(t=1337,e=0){this.rng=new b(t),this.trex=new Q,this.horizon=new I(this.rng),this.scoreManager=new O(e),this.dayNightManager=new H,this.reset(t)}reset(t){t!==void 0&&this.rng.setSeed(t),this.phase="READY",this.speed=u.SPEED,this.elapsedMs=0,this.crashTimerMs=0,this.introTimerMs=0,this.currentEvents=[],this.trex.reset(),this.horizon.reset(),this.scoreManager.reset(),this.dayNightManager.reset()}get state(){const t=this.scoreManager.score,e=Math.floor(t/u.INVERT_DISTANCE)%7;return{phase:this.phase,trex:this.trex.getState(),obstacles:this.horizon.getObstacleStates(),clouds:this.horizon.getCloudStates(),groundOffset:this.horizon.groundOffset,speed:this.speed,distance:this.scoreManager.distance,score:t,highScore:this.scoreManager.highScore,isNight:this.dayNightManager.isNight,nightFade:this.dayNightManager.nightFade,moonPhase:this.dayNightManager.moonPhase,isFlashing:this.scoreManager.isFlashing,flashIterations:this.scoreManager.flashIterations,elapsedMs:this.elapsedMs,biomeIndex:e,events:[...this.currentEvents]}}step(t,e=1){this.currentEvents=[];const i=e*(1e3/u.FPS);switch(this.elapsedMs+=i,this.phase){case"BOOT":case"READY":this.handleReadyPhase(t,e);break;case"INTRO":this.handleIntroPhase(t,e,i);break;case"RUNNING":this.handleRunningPhase(t,e,i);break;case"CRASHED":this.handleCrashedPhase(t,i);break}}handleReadyPhase(t,e){this.trex.updateAnim(e),t.jumpPressed&&(this.phase="INTRO",this.introTimerMs=0,this.currentEvents.push("jump"),this.trex.startJump(this.speed))}handleIntroPhase(t,e,i){this.introTimerMs+=i,this.trex.updateJump(e)&&this.currentEvents.push("land"),this.trex.updateAnim(e),this.horizon.update(this.speed,e),this.introTimerMs>=d.INTRO_DURATION&&(this.phase="RUNNING")}handleRunningPhase(t,e,i){t.duckHeld?this.trex.setDuck(!0):this.trex.setDuck(!1),t.jumpPressed?this.trex.startJump(this.speed)&&this.currentEvents.push("jump"):!t.jumpHeld&&this.trex.jumping&&this.trex.endJump(),this.trex.updateJump(e)&&this.currentEvents.push("land"),this.trex.updateAnim(e),this.horizon.update(this.speed,e);const o=this.trex.getState(),n=this.horizon.obstacles;for(let c=0;c<n.length;c++){const p=n[c].getState();if(k(o,p)){this.phase="CRASHED",this.crashTimerMs=0,this.currentEvents.push("crash"),this.scoreManager.onCrash()&&this.currentEvents.push("highScore");return}N(o,p,6)&&this.currentEvents.push("nearMiss")}this.speed<u.MAX_SPEED&&(this.speed=Math.min(u.MAX_SPEED,this.speed+u.ACCELERATION*e));const{milestoneAchieved:r,newHighScore:a}=this.scoreManager.update(this.speed,e,1e3/u.FPS);r&&this.currentEvents.push("milestone"),a&&this.currentEvents.push("highScore");const{biomeChanged:h}=this.dayNightManager.update(this.scoreManager.score,e,1e3/u.FPS);h&&this.currentEvents.push("biomeChange")}handleCrashedPhase(t,e){if(this.crashTimerMs+=e,this.crashTimerMs>=u.GAMEOVER_CLEAR_TIME&&(t.restartPressed||t.jumpPressed)){const i=this.scoreManager.highScore;this.reset(),this.scoreManager.setHighScore(i),this.phase="RUNNING"}}}class V{logicalWidth=600;logicalHeight=150;aspectRatio=4/1;cssWidth=600;cssHeight=150;dpr=1;scale=1;canvas;onResizeCallbacks=[];constructor(t){this.canvas=t,this.updateDimensions(),window.addEventListener("resize",this.handleResize),window.addEventListener("orientationchange",this.handleResize)}handleResize=()=>{this.updateDimensions();for(const t of this.onResizeCallbacks)t()};onResize(t){this.onResizeCallbacks.push(t)}updateDimensions(){this.dpr=window.devicePixelRatio||1;const t=this.canvas.parentElement,e=t?t.clientWidth:window.innerWidth,i=t?t.clientHeight:window.innerHeight;let s=e,o=s/this.aspectRatio;o>i&&i>0&&(o=i,s=o*this.aspectRatio),this.cssWidth=s,this.cssHeight=o,this.scale=this.cssWidth/this.logicalWidth,this.canvas.width=Math.round(this.cssWidth*this.dpr),this.canvas.height=Math.round(this.cssHeight*this.dpr),this.canvas.style.width=`${this.cssWidth}px`,this.canvas.style.height=`${this.cssHeight}px`}applyTransform(t){t.setTransform(1,0,0,1,0,0),t.scale(this.scale*this.dpr,this.scale*this.dpr)}destroy(){window.removeEventListener("resize",this.handleResize),window.removeEventListener("orientationchange",this.handleResize)}}const z=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
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
`,U=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
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
`,Z=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
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
`,W=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 25" width="59" height="25">
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
`,X=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 25" width="59" height="25">
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
`,j=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 47" width="44" height="47">
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
`,Y=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
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
`,q=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 35" width="34" height="35">
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
`,K=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 35" width="51" height="35">
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
`,$=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
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
`,J=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
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
`,tt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 50" width="75" height="50">
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
`,et=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40" width="46" height="40">
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
`,it=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40" width="46" height="40">
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
`,st=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 14" width="46" height="14">
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
`,nt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,ot=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,rt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,at=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,lt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,ht=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,ct=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
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
`,dt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="9" height="9">
  <!-- Modern 4-point twinkle star -->
  <path d="M 4.5 0 Q 4.5 4.5 0 4.5 Q 4.5 4.5 4.5 9 Q 4.5 4.5 9 4.5 Q 4.5 4.5 4.5 0 Z" fill="#FFFFFF" opacity="0.9" />
  <circle cx="4.5" cy="4.5" r="1.2" fill="#FFFFFF" />
</svg>
`,ut=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" width="36" height="32">
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
`,ft=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
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
`,pt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
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
`,gt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
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
`,mt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
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
`,yt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Volcanic Charred Cactus / Spike: 17x35 -->
  <g fill="currentColor">
    <path d="M5 0h4v35H5V0z" />
    <path d="M1 8h3v14H1V8z M1 22h4v3H1z" />
    <path d="M9 15h5v3H9z M13 5h3v10h-3V5z" />
    <!-- Lava cracks -->
    <path d="M7 6l2 8-2 6 2 10" stroke="#FF4500" stroke-width="1" fill="none" />
  </g>
</svg>
`,Ft=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
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
`,wt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 35" width="17" height="35">
  <!-- Neon Wireframe Cactus: 17x35 -->
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="5" y="1" width="4" height="33" />
    <path d="M1 8h3v14H1z" />
    <path d="M1 22h4" />
    <path d="M13 5h3v10h-3z" />
    <path d="M9 15h4" />
  </g>
</svg>
`,xt=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50" width="25" height="50">
  <!-- Neon Wireframe Large: 25x50 -->
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="9" y="1" width="6" height="48" />
    <path d="M1 12h5v22H1z" />
    <path d="M1 34h8" />
    <path d="M19 11h5v16h-5z" />
    <path d="M15 27h9" />
  </g>
</svg>
`,Mt={"trex-idle":z,"trex-run1":U,"trex-run2":Z,"trex-duck1":W,"trex-duck2":X,"trex-dead":j,"cactus-small-1":Y,"cactus-small-2":q,"cactus-small-3":K,"cactus-large-1":$,"cactus-large-2":J,"cactus-large-3":tt,"ptero-1":et,"ptero-2":it,cloud:st,"moon-0":nt,"moon-1":ot,"moon-2":rt,"moon-3":at,"moon-4":lt,"moon-5":ht,"moon-6":ct,star:dt,restart:ut,"canyon-small":ft,"canyon-large":pt,"tundra-small":gt,"tundra-large":mt,"volcanic-small":yt,"volcanic-large":Ft,"neon-small":wt,"neon-large":xt};class St{cache=new Map;scale=1;dpr=1;constructor(){this.updateScale(1,1)}updateScale(t,e){this.scale===t&&this.dpr===e&&this.cache.size>0||(this.scale=t,this.dpr=e,this.cache.clear(),this.prewarmCommonSprites())}prewarmCommonSprites(){this.getSprite("trex-idle","#535353",44,47),this.getSprite("trex-run1","#535353",44,47),this.getSprite("trex-run2","#535353",44,47),this.getSprite("trex-duck1","#535353",59,25),this.getSprite("trex-duck2","#535353",59,25),this.getSprite("cactus-small-1","#4F6F52",17,35),this.getSprite("cactus-small-2","#4F6F52",34,35),this.getSprite("cactus-small-3","#4F6F52",51,35),this.getSprite("cactus-large-1","#4F6F52",25,50),this.getSprite("cactus-large-2","#4F6F52",50,50),this.getSprite("cactus-large-3","#4F6F52",75,50),this.getSprite("ptero-1","#535353",46,40),this.getSprite("ptero-2","#535353",46,40),this.getSprite("cloud","#FFFFFF",46,14),this.getSprite("star","#FFFFFF",9,9);for(let t=0;t<7;t++)this.getSprite(`moon-${t}`,"#F8FAFC",32,32)}getSprite(t,e="#535353",i,s){const o=Mt[t];if(!o)return null;const n=Math.max(1,Math.round(i*this.scale*this.dpr)),r=Math.max(1,Math.round(s*this.scale*this.dpr)),a=o.includes("currentColor"),c=`${t}_${a?e:"default"}_${n}_${r}`,p=this.cache.get(c);if(p)return p;const f=a?o.replace(/currentColor/g,e):o,v=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(f)}`,x=document.createElement("canvas");x.width=n,x.height=r;const g=x.getContext("2d"),m=new Image;return m.onload=()=>{g&&(g.imageSmoothingEnabled=!1,g.drawImage(m,0,0,n,r))},m.src=v,this.cache.set(c,x),x}}const Tt={skyTop:"#FFFFFF",skyBottom:"#FFFFFF",dinoBody:"#535353",dinoShade:"#535353",cactus:"#535353",ground:"#535353",farDunes:"#FFFFFF",midDunes:"#FFFFFF",accent:"#535353"},At={skyTop:"#000000",skyBottom:"#000000",dinoBody:"#FFFFFF",dinoShade:"#FFFFFF",cactus:"#FFFFFF",ground:"#FFFFFF",farDunes:"#000000",midDunes:"#000000",accent:"#FFFFFF"};function E(l){const t=l.replace("#","");if(t.length===3){const o=parseInt(t[0]+t[0],16),n=parseInt(t[1]+t[1],16),r=parseInt(t[2]+t[2],16);return[o,n,r]}const e=parseInt(t.substring(0,2),16),i=parseInt(t.substring(2,4),16),s=parseInt(t.substring(4,6),16);return[e,i,s]}function vt(l,t,e){const i=o=>Math.max(0,Math.min(255,Math.round(o))),s=o=>i(o).toString(16).padStart(2,"0");return`#${s(l)}${s(t)}${s(e)}`}function y(l,t,e){const i=Math.max(0,Math.min(1,e)),[s,o,n]=E(l),[r,a,h]=E(t),c=s+(r-s)*i,p=o+(a-o)*i,f=n+(h-n)*i;return vt(c,p,f)}function L(l,t,e){return{skyTop:y(l.skyTop,t.skyTop,e),skyBottom:y(l.skyBottom,t.skyBottom,e),dinoBody:y(l.dinoBody,t.dinoBody,e),dinoShade:y(l.dinoShade,t.dinoShade,e),cactus:y(l.cactus,t.cactus,e),ground:y(l.ground,t.ground,e),farDunes:y(l.farDunes,t.farDunes,e),midDunes:y(l.midDunes,t.midDunes,e),accent:y(l.accent,t.accent,e)}}class Lt{farOffset=0;midOffset=0;update(t,e=1){this.farOffset=(this.farOffset+.1*t*e)%600,this.midOffset=(this.midOffset+.3*t*e)%600}drawSky(t,e,i,s,o=0){const n=t.createLinearGradient(0,0,0,i);n.addColorStop(0,s.skyTop),n.addColorStop(.7,s.skyBottom),n.addColorStop(1,s.ground),t.fillStyle=n,t.fillRect(0,0,e,i);const r=Math.max(0,1-o*1.5);if(r>.01){t.save(),t.globalAlpha=r;const a=t.createRadialGradient(390,26,4,390,26,32);a.addColorStop(0,"rgba(255, 235, 180, 0.7)"),a.addColorStop(.35,"rgba(255, 215, 140, 0.25)"),a.addColorStop(1,"rgba(255, 200, 100, 0)"),t.fillStyle=a,t.beginPath(),t.arc(390,26,32,0,Math.PI*2),t.fill(),t.fillStyle="rgba(255, 250, 230, 0.9)",t.beginPath(),t.arc(390,26,9,0,Math.PI*2),t.fill(),t.restore()}}drawFarDunes(t,e,i,s=0){t.save();const o=this.farOffset,n=t.createLinearGradient(0,85,0,127);n.addColorStop(0,i.farDunes),n.addColorStop(1,i.midDunes),t.fillStyle=n,t.beginPath(),t.moveTo(0,127);for(let a=-o-300;a<=e+600;a+=300)t.bezierCurveTo(a+80,96,a+180,114,a+300,127);t.lineTo(e,127),t.lineTo(0,127),t.closePath(),t.fill();const r=Math.max(.02,.1*(1-s*.7));t.strokeStyle=`rgba(255, 255, 255, ${r})`,t.lineWidth=1,t.stroke(),t.restore()}drawMidDunes(t,e,i,s=0){t.save();const o=this.midOffset,n=t.createLinearGradient(0,105,0,127);n.addColorStop(0,i.midDunes),n.addColorStop(1,i.ground),t.fillStyle=n,t.beginPath(),t.moveTo(0,127);for(let a=-o-200;a<=e+400;a+=200)t.quadraticCurveTo(a+50,112,a+100,116),t.quadraticCurveTo(a+150,120,a+200,127);t.lineTo(e,127),t.lineTo(0,127),t.closePath(),t.fill();const r=Math.max(.02,.08*(1-s*.7));t.strokeStyle=`rgba(255, 255, 255, ${r})`,t.lineWidth=1,t.stroke(),t.restore()}reset(){this.farOffset=0,this.midOffset=0}}class Ct{maxParticles=100;pool=[];runDustTimer=0;constructor(){for(let t=0;t<this.maxParticles;t++)this.pool.push({x:0,y:0,vx:0,vy:0,size:2,color:"#8A8A8A",alpha:1,decay:.05,active:!1})}spawn(t,e,i,s,o,n,r=.8,a=.04){const h=this.pool.find(c=>!c.active);h&&(h.x=t,h.y=e,h.vx=i,h.vy=s,h.size=o,h.color=n,h.alpha=r,h.decay=a,h.active=!0)}emitRunDust(t,e,i){this.runDustTimer++,this.runDustTimer>=6&&(this.runDustTimer=0,this.spawn(t+4,e+44,-1.5-Math.random()*.8,-.5-Math.random()*.5,2+Math.random()*1.5,i,.5,.06))}emitLandingDust(t,e,i){for(let s=0;s<6;s++){const o=Math.PI/6*s+Math.PI,n=1.2+Math.random()*1.5;this.spawn(t+20,e+44,Math.cos(o)*n,Math.sin(o)*.8,2.5+Math.random()*2,i,.7,.05)}}emitDeathBurst(t,e,i){for(let s=0;s<18;s++){const o=Math.random()*Math.PI*2,n=1.5+Math.random()*3.5;this.spawn(t+22,e+24,Math.cos(o)*n,Math.sin(o)*n,2+Math.random()*2.5,i,.9,.035)}}update(t=1){for(let e=0;e<this.maxParticles;e++){const i=this.pool[e];i.active&&(i.x+=i.vx*t,i.y+=i.vy*t,i.alpha-=i.decay*t,i.alpha<=0&&(i.active=!1))}}draw(t){t.save();for(let e=0;e<this.maxParticles;e++){const i=this.pool[e];i.active&&(t.globalAlpha=Math.max(0,i.alpha),t.fillStyle=i.color,t.fillRect(Math.round(i.x),Math.round(i.y),i.size,i.size))}t.restore()}reset(){for(let t=0;t<this.maxParticles;t++)this.pool[t].active=!1;this.runDustTimer=0}}class Et{draw(t,e,i){t.save(),t.font="bold 11px ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace";const s=String(e.score).padStart(5,"0"),o=`HI ${String(e.highScore).padStart(5,"0")}`;t.fillStyle=e.isNight?"#7A8499":"#8A8A8A",t.fillText(o,480,20),(!e.isFlashing||e.flashIterations%2===0)&&(t.fillStyle=e.isFlashing?i.accent:i.dinoBody,t.fillText(s,550,20)),t.restore()}}class Dt{overlayEl;muteBtn=null;retroBtn=null;uiBar=null;onMuteClick;onRetroClick;constructor(){this.overlayEl=document.getElementById("overlay"),this.setupDomButtons()}setupDomButtons(){this.overlayEl&&(this.overlayEl.innerHTML=`
      <div class="ui-bar" role="toolbar" aria-label="Game controls">
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
      </div>
    `,this.uiBar=this.overlayEl.querySelector(".ui-bar"),this.muteBtn=document.getElementById("btn-mute"),this.retroBtn=document.getElementById("btn-retro"),this.muteBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onMuteClick?.()}),this.retroBtn?.addEventListener("click",t=>{t.stopPropagation(),this.onRetroClick?.()}))}updateButtons(t,e){if(this.muteBtn){const i=t?'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>':'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';this.muteBtn.innerHTML=`<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i}</svg><span class="btn-text">${t?"SFX: OFF":"SFX: ON"}</span>`,this.muteBtn.classList.toggle("is-off",t),this.muteBtn.classList.toggle("is-on",!t)}if(this.retroBtn){const i=e?'<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1.5" fill="currentColor"></circle><circle cx="10" cy="12" r="1.5" fill="currentColor"></circle><line x1="15" y1="9" x2="19" y2="9"></line><line x1="17" y1="13" x2="17" y2="17"></line>':'<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';this.retroBtn.innerHTML=`<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i}</svg><span class="btn-text">${e?"RETRO: ON":"RETRO: OFF"}</span>`,this.retroBtn.classList.toggle("is-retro-active",e)}}setNightTheme(t){this.uiBar&&this.uiBar.classList.toggle("night",t)}draw(t,e,i,s,o){if(this.setNightTheme(e.isNight),t.save(),e.phase==="READY")t.fillStyle=s,t.font="12px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center",t.fillText("PRESS SPACE OR TAP TO PLAY",o/2,75);else if(e.phase==="CRASHED"){t.fillStyle=s,t.font="bold 16px ui-monospace, SF Mono, Menlo, monospace",t.textAlign="center",t.fillText("G A M E   O V E R",o/2,65);const n=i.getSprite("restart",s,36,32);n&&t.drawImage(n,o/2-18,80,36,32),t.font="10px ui-monospace, SF Mono, Menlo, monospace",t.fillText("TAP OR PRESS SPACE TO RESTART",o/2,126)}t.restore()}}const A=[{id:"desert",name:"Classic Desert",weatherType:"sand",dayPalette:{skyTop:"#F7F7F2",skyBottom:"#E9EEF2",dinoBody:"#535353",dinoShade:"#3E3E3E",cactus:"#4F6F52",ground:"#535353",farDunes:"#E3DCCB",midDunes:"#D2C8AE",accent:"#FFB020"},nightPalette:{skyTop:"#0F172A",skyBottom:"#1E293B",dinoBody:"#F8FAFC",dinoShade:"#CBD5E1",cactus:"#34D399",ground:"#334155",farDunes:"#162033",midDunes:"#1E293B",accent:"#38BDF8"}},{id:"canyon",name:"Canyon Sunset",weatherType:"fireflies",dayPalette:{skyTop:"#FFD9A8",skyBottom:"#FFAE73",dinoBody:"#3F2822",dinoShade:"#2B1A16",cactus:"#E88B5A",ground:"#5A3A32",farDunes:"#E88B5A",midDunes:"#C55A3C",accent:"#FF6B35"},nightPalette:{skyTop:"#1E132D",skyBottom:"#2C1A40",dinoBody:"#F5EEF8",dinoShade:"#D8BFD8",cactus:"#E07A5F",ground:"#3B284A",farDunes:"#261536",midDunes:"#1C0F28",accent:"#FF6B35"}},{id:"oasis",name:"Oasis Sanctuary",weatherType:"rain",dayPalette:{skyTop:"#DFF3EA",skyBottom:"#C1EAD8",dinoBody:"#374E45",dinoShade:"#23372F",cactus:"#2EC4B6",ground:"#4A5A4F",farDunes:"#A8D5BA",midDunes:"#6FB38A",accent:"#2EC4B6"},nightPalette:{skyTop:"#051E22",skyBottom:"#0B2D33",dinoBody:"#E6FFFA",dinoShade:"#A7F3D0",cactus:"#2DD4BF",ground:"#134E4A",farDunes:"#08282E",midDunes:"#0E3840",accent:"#2EC4B6"}},{id:"tundra",name:"Frozen Tundra",weatherType:"snow",dayPalette:{skyTop:"#E8F4FF",skyBottom:"#D0E8FC",dinoBody:"#38485B",dinoShade:"#243242",cactus:"#7DF9FF",ground:"#55677A",farDunes:"#C9E3F5",midDunes:"#A4CBE6",accent:"#7DF9FF"},nightPalette:{skyTop:"#0A1128",skyBottom:"#132247",dinoBody:"#F0F9FF",dinoShade:"#BAE6FD",cactus:"#38BDF8",ground:"#1E293B",farDunes:"#0E1736",midDunes:"#16254F",accent:"#7DF9FF"}},{id:"volcanic",name:"Volcanic Badlands",weatherType:"embers",dayPalette:{skyTop:"#8C7B75",skyBottom:"#71605A",dinoBody:"#2B2322",dinoShade:"#1C1514",cactus:"#FF4500",ground:"#2B2322",farDunes:"#5A4A47",midDunes:"#3D302E",accent:"#FF4500"},nightPalette:{skyTop:"#180A0C",skyBottom:"#261014",dinoBody:"#FFE4E6",dinoShade:"#FECDD3",cactus:"#FB7185",ground:"#2E1217",farDunes:"#1F0B0E",midDunes:"#2A1014",accent:"#FF4500"}},{id:"neon",name:"Neon Future",weatherType:"grid",dayPalette:{skyTop:"#1B1033",skyBottom:"#28174D",dinoBody:"#00F0FF",dinoShade:"#00B8C4",cactus:"#FF2E97",ground:"#2A1B4D",farDunes:"#3A1B6E",midDunes:"#5B2A9B",accent:"#FF2E97"},nightPalette:{skyTop:"#080414",skyBottom:"#12072B",dinoBody:"#00F0FF",dinoShade:"#00B8C4",cactus:"#FF2E97",ground:"#2A1352",farDunes:"#15082E",midDunes:"#1E0A40",accent:"#FF2E97"}},{id:"space",name:"Space Dunes",weatherType:"cosmic",dayPalette:{skyTop:"#0B0F2A",skyBottom:"#151C47",dinoBody:"#D8B4FE",dinoShade:"#A855F7",cactus:"#C084FC",ground:"#151C47",farDunes:"#1E255E",midDunes:"#2C3582",accent:"#B388FF"},nightPalette:{skyTop:"#05081A",skyBottom:"#0D1438",dinoBody:"#F3E8FF",dinoShade:"#D8B4FE",cactus:"#A855F7",ground:"#23184A",farDunes:"#090D2A",midDunes:"#121740",accent:"#B388FF"}}];class Bt{currentBiomeIndex=0;targetBiomeIndex=0;transitionProgress=1;transitionDurationMs=3e3;get currentBiome(){return A[this.currentBiomeIndex%A.length]}get targetBiome(){return A[this.targetBiomeIndex%A.length]}update(t,e){let i=!1;return t!==this.targetBiomeIndex&&(this.currentBiomeIndex=this.targetBiomeIndex,this.targetBiomeIndex=t,this.transitionProgress=0,i=!0),this.transitionProgress<1&&(this.transitionProgress=Math.min(1,this.transitionProgress+e/this.transitionDurationMs),this.transitionProgress>=1&&(this.currentBiomeIndex=this.targetBiomeIndex)),{transitioned:i}}getPalette(t,e){const i=this.currentBiome,s=this.targetBiome,o=L(i.dayPalette,i.nightPalette,e);if(this.transitionProgress>=1)return o;const n=L(s.dayPalette,s.nightPalette,e);return L(o,n,this.transitionProgress)}}class kt{weatherParticles=[];maxWeatherParticles=50;ufoX=-100;ufoActive=!1;lizardX=-50;lizardActive=!1;constructor(){for(let t=0;t<this.maxWeatherParticles;t++)this.weatherParticles.push({x:Math.random()*600,y:Math.random()*125,vx:-1-Math.random()*2,vy:.2+Math.random()*.5,size:1.5,alpha:.4+Math.random()*.4,color:"#FFFFFF"})}update(t,e,i,s=1){for(let o=0;o<this.maxWeatherParticles;o++){const n=this.weatherParticles[o];switch(t){case"sand":n.vx=-e*.4-Math.random()*1,n.vy=(Math.random()-.5)*.3,n.color="#D2C8AE",n.size=1.5;break;case"snow":n.vx=-e*.2-.5,n.vy=.8+Math.random()*.5,n.color="#FFFFFF",n.size=2;break;case"embers":n.vx=-e*.3-.8,n.vy=-.6-Math.random()*.6,n.color=Math.random()>.5?"#FF4500":"#FFD700",n.size=1.8;break;case"rain":n.vx=-e*.5-2,n.vy=4+Math.random()*2,n.color="#7DF9FF",n.size=2;break;case"fireflies":case"cosmic":default:n.vx=-e*.2+(Math.random()-.5)*.5,n.vy=(Math.random()-.5)*.4,n.color="#FFDE59",n.size=1.8;break}n.x+=n.vx*s,n.y+=n.vy*s,n.x<0&&(n.x=600),n.x>600&&(n.x=0),n.y<0&&(n.y=125),n.y>125&&(n.y=0)}!this.lizardActive&&Math.random()<.002&&(this.lizardActive=!0,this.lizardX=620),this.lizardActive&&(this.lizardX-=(e+2)*s,this.lizardX<-40&&(this.lizardActive=!1)),!this.ufoActive&&i>2e3&&i%3e3<150&&(this.ufoActive=!0,this.ufoX=650),this.ufoActive&&(this.ufoX-=2*s,this.ufoX<-80&&(this.ufoActive=!1))}draw(t,e){if(!e){t.save();for(let i=0;i<this.maxWeatherParticles;i++){const s=this.weatherParticles[i];t.globalAlpha=s.alpha,t.fillStyle=s.color,t.beginPath(),t.arc(s.x,s.y,Math.max(.6,s.size/2),0,Math.PI*2),t.fill()}this.lizardActive&&(t.globalAlpha=.5,t.fillStyle="#654321",t.fillRect(Math.round(this.lizardX),125,8,2),t.fillRect(Math.round(this.lizardX+7),124,3,2)),this.ufoActive&&(t.globalAlpha=.8,t.fillStyle="#B0C4DE",t.beginPath(),t.ellipse(this.ufoX,22,12,4,0,0,Math.PI*2),t.fill(),t.fillStyle="#00FFFF",t.beginPath(),t.arc(this.ufoX,20,5,Math.PI,0),t.fill(),t.fillStyle="#00FFCC",t.globalAlpha=.15,t.beginPath(),t.moveTo(this.ufoX-2,26),t.lineTo(this.ufoX+2,26),t.lineTo(this.ufoX+10,60),t.lineTo(this.ufoX-10,60),t.closePath(),t.fill()),t.restore()}}}class Gt{hasSunglasses=!1;nearMissTimerMs=0;milestoneTimerMs=0;idleTimeMs=0;triggerNearMiss(){this.nearMissTimerMs=500}triggerMilestone(){this.milestoneTimerMs=800}update(t,e){this.nearMissTimerMs>0&&(this.nearMissTimerMs-=e),this.milestoneTimerMs>0&&(this.milestoneTimerMs-=e),t.phase==="READY"?this.idleTimeMs+=e:this.idleTimeMs=0}drawOverlays(t,e,i){if(i)return;const s=e.trex;if(t.save(),this.hasSunglasses){t.fillStyle="#111111";const o=s.ducking?s.x+s.w-18:s.x+23,n=s.ducking?s.y+3:s.y+1;t.fillRect(o-1,n,10,4),t.fillStyle="#00FFFF",t.fillRect(o+1,n+1,2,2),t.fillRect(o+6,n+1,2,2)}if(this.nearMissTimerMs>0){t.fillStyle="#00E5FF";const o=s.x+18,n=s.y-4;t.beginPath(),t.arc(o,n,2.5,0,Math.PI*2),t.fill()}if(e.phase==="READY"&&this.idleTimeMs>1e4){t.fillStyle="#999999",t.font="bold 9px monospace";const o=Math.sin(this.idleTimeMs/400)*4;t.fillText("z",s.x+28,s.y-4+o),t.fillText("Z",s.x+36,s.y-12+o)}t.restore()}}class Rt{badgeText=null;badgeTimerMs=0;badgeDurationMs=1200;bannerText=null;bannerTimerMs=0;bannerDurationMs=1500;badgeAdjectives=["Nice!","Smooth!","Speedy!","Unstoppable!"];lastAwardedMilestone=0;checkMilestone(t){if(t>=500&&Math.floor(t/500)>Math.floor(this.lastAwardedMilestone/500)){const e=Math.floor(t/500)*500;this.lastAwardedMilestone=t;const i=(e/500-1)%this.badgeAdjectives.length;this.showBadge(`${e} · ${this.badgeAdjectives[i]}`)}}showBadge(t){this.badgeText=t,this.badgeTimerMs=this.badgeDurationMs}showBiomeBanner(t){this.bannerText=t.toUpperCase(),this.bannerTimerMs=this.bannerDurationMs}update(t){this.badgeTimerMs>0&&(this.badgeTimerMs-=t,this.badgeTimerMs<=0&&(this.badgeText=null)),this.bannerTimerMs>0&&(this.bannerTimerMs-=t,this.bannerTimerMs<=0&&(this.bannerText=null))}draw(t,e,i){if(!i){if(t.save(),t.textAlign="center",this.bannerText&&this.bannerTimerMs>0){const s=Math.min(1,this.bannerTimerMs/300);t.globalAlpha=s,t.font="bold 12px ui-monospace, SF Mono, Menlo, monospace",t.fillStyle="#FFB020",t.fillText(`— ${this.bannerText} —`,e/2,38)}if(this.badgeText&&this.badgeTimerMs>0){const s=Math.min(1,this.badgeTimerMs/300);t.globalAlpha=s,t.fillStyle="rgba(0, 0, 0, 0.7)",t.beginPath(),t.roundRect(e/2-60,48,120,20,10),t.fill(),t.fillStyle="#FFFFFF",t.font="bold 10px ui-monospace, SF Mono, Menlo, monospace",t.fillText(this.badgeText,e/2,62)}t.restore()}}reset(){this.badgeText=null,this.badgeTimerMs=0,this.bannerText=null,this.bannerTimerMs=0,this.lastAwardedMilestone=0}}class bt{ctx;camera;atlas;layers;particles;hud;overlay;biomes;props;expressions;badges;showHitboxes=!1;isRetro=!1;reducedEffects=!1;screenShakeTimeMs=0;screenShakeIntensity=0;flashTimeMs=0;squashStretchX=1;squashStretchY=1;slowFrameCounter=0;autoDegraded=!1;constructor(t,e){const i=t.getContext("2d");if(!i)throw new Error("Failed to get 2D rendering context");this.ctx=i,this.camera=e,this.atlas=new St,this.layers=new Lt,this.particles=new Ct,this.hud=new Et,this.overlay=new Dt,this.biomes=new Bt,this.props=new kt,this.expressions=new Gt,this.badges=new Rt,this.camera.onResize(()=>{this.atlas.updateScale(this.camera.scale,this.camera.dpr)})}draw(t,e=1){const i=this.ctx,s=1e3/60;this.atlas.updateScale(this.camera.scale,this.camera.dpr);const{transitioned:o}=this.biomes.update(t.biomeIndex,s);o&&!this.isRetro&&this.badges.showBiomeBanner(this.biomes.targetBiome.name),this.badges.checkMilestone(t.score),this.badges.update(s),this.expressions.update(t,s),!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.props.update(this.biomes.currentBiome.weatherType,t.speed,t.score,1),this.processEvents(t),this.updateVisualEffects(t),this.camera.applyTransform(i);let n=0,r=0;this.screenShakeIntensity>0&&!this.reducedEffects&&!this.isRetro&&(n=(Math.random()-.5)*this.screenShakeIntensity*2,r=(Math.random()-.5)*this.screenShakeIntensity*2,i.translate(n,r));const a=this.computePalette(t);this.isRetro?(i.fillStyle=a.skyTop,i.fillRect(0,0,this.camera.logicalWidth,this.camera.logicalHeight)):(this.layers.drawSky(i,this.camera.logicalWidth,this.camera.logicalHeight,a,t.nightFade),(t.isNight||t.nightFade>.05)&&(i.save(),i.globalAlpha=t.nightFade,this.drawNightSky(t),i.restore()),this.layers.drawFarDunes(i,this.camera.logicalWidth,a,t.nightFade));for(const h of t.clouds){i.save(),!this.isRetro&&(t.isNight||t.nightFade>.1)&&(i.globalAlpha=Math.max(.3,1-t.nightFade*.55));const c=this.atlas.getSprite("cloud","#FFFFFF",46,14);c&&i.drawImage(c,h.x,h.y,46,14),i.restore()}this.isRetro||(this.layers.drawMidDunes(i,this.camera.logicalWidth,a,t.nightFade),!this.reducedEffects&&!this.autoDegraded&&this.props.draw(i,this.isRetro)),this.drawGround(t,a.ground),!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.particles.draw(i),this.drawSpeedLines(t),this.drawObstacles(t,a.cactus,a.dinoBody),this.drawTrex(t,a.dinoBody),this.expressions.drawOverlays(i,t,this.isRetro),this.drawVignette(),this.hud.draw(i,t,a),this.badges.draw(i,this.camera.logicalWidth,this.isRetro),this.overlay.draw(i,t,this.atlas,a.dinoBody,this.camera.logicalWidth),this.flashTimeMs>0&&!this.reducedEffects&&!this.isRetro&&(i.save(),i.fillStyle="#FFFFFF",i.globalAlpha=Math.min(1,this.flashTimeMs/80),i.fillRect(0,0,this.camera.logicalWidth,this.camera.logicalHeight),i.restore())}recordFrameDuration(t){t>16.6?(this.slowFrameCounter++,this.slowFrameCounter>120&&(this.autoDegraded=!0)):this.slowFrameCounter=Math.max(0,this.slowFrameCounter-1)}computePalette(t){return this.isRetro?t.isNight?At:Tt:this.biomes.getPalette(t.isNight,t.nightFade)}processEvents(t){for(const e of t.events)e==="jump"?(this.squashStretchX=.92,this.squashStretchY=1.08):e==="land"?(this.squashStretchX=1.08,this.squashStretchY=.92,!this.isRetro&&!this.reducedEffects&&this.particles.emitLandingDust(t.trex.x,t.trex.y,"#8A8A8A")):e==="crash"?!this.reducedEffects&&!this.isRetro&&(this.screenShakeTimeMs=300,this.screenShakeIntensity=6,this.flashTimeMs=80,this.particles.emitDeathBurst(t.trex.x,t.trex.y,"#535353")):e==="nearMiss"?this.expressions.triggerNearMiss():e==="milestone"&&this.expressions.triggerMilestone();t.phase==="RUNNING"&&!t.trex.jumping&&!this.isRetro&&!this.reducedEffects&&!this.autoDegraded&&this.particles.emitRunDust(t.trex.x,t.trex.y,"#8A8A8A")}updateVisualEffects(t){const e=16.666666666666668;this.screenShakeTimeMs>0&&(this.screenShakeTimeMs-=e,this.screenShakeIntensity=Math.max(0,this.screenShakeTimeMs/300*6)),this.flashTimeMs>0&&(this.flashTimeMs-=e),this.squashStretchX+=(1-this.squashStretchX)*.15,this.squashStretchY+=(1-this.squashStretchY)*.15,(t.phase==="RUNNING"||t.phase==="INTRO")&&this.layers.update(t.speed,1),this.particles.update(1)}drawNightSky(t){const e=this.ctx,s=this.atlas.getSprite("star","#FFFFFF",9,9),o=[[35,20,!1],[75,14,!0],[115,32,!1],[160,18,!0],[210,38,!1],[255,15,!0],[395,22,!0],[435,36,!1],[515,16,!0],[570,34,!1]];for(const[h,c,p]of o)p&&s?e.drawImage(s,h-4,c-4,8,8):(e.fillStyle="rgba(255, 255, 255, 0.85)",e.beginPath(),e.arc(h,c,1.2,0,Math.PI*2),e.fill());const n=`moon-${t.moonPhase%7}`,r=this.atlas.getSprite(n,"#F8FAFC",32,32);e.save();const a=e.createRadialGradient(330,24,6,330,24,34);a.addColorStop(0,"rgba(240, 248, 255, 0.35)"),a.addColorStop(.4,"rgba(186, 230, 253, 0.12)"),a.addColorStop(1,"rgba(186, 230, 253, 0)"),e.fillStyle=a,e.beginPath(),e.arc(330,24,34,0,Math.PI*2),e.fill(),r&&e.drawImage(r,314,8,32,32),e.restore()}drawGround(t,e){const i=this.ctx,s=this.camera.logicalWidth;if(this.isRetro){i.strokeStyle=e,i.lineWidth=1,i.beginPath(),i.moveTo(0,127.5),i.lineTo(s,127.5),i.stroke(),i.fillStyle=e;const f=t.groundOffset%40;for(let F=-f;F<s;F+=40)i.fillRect(F,130,4,1.5),i.fillRect(F+18,134,6,1.5);return}i.save();const o=t.isNight||t.nightFade>.25,n=i.createLinearGradient(0,127,0,150),r=o?"#221930":e,a=o?"#100B17":"#0F172A";n.addColorStop(0,r),n.addColorStop(1,a),i.fillStyle=n,i.fillRect(0,127,s,23),i.strokeStyle=o?"#5A4A70":e,i.lineWidth=1.5,i.beginPath(),i.moveTo(0,127.5),i.lineTo(s,127.5),i.stroke();const h=t.groundOffset%60,c=o?"rgba(255, 255, 255, 0.12)":"rgba(255, 255, 255, 0.22)",p=o?"rgba(0, 0, 0, 0.35)":"rgba(0, 0, 0, 0.28)";for(let f=-h;f<s+60;f+=60)i.fillStyle=c,i.beginPath(),i.ellipse(f+14,131,2,1,0,0,Math.PI*2),i.fill(),i.fillStyle=p,i.beginPath(),i.ellipse(f+38,134,2.5,1.2,0,0,Math.PI*2),i.fill(),i.fillStyle=o?"rgba(255, 255, 255, 0.05)":"rgba(255, 255, 255, 0.1)",i.fillRect(f+22,138,8,1),i.fillRect(f+46,142,6,1);i.restore()}drawDropShadow(t,e,i,s,o){const n=this.ctx;n.save(),n.fillStyle=`rgba(0, 0, 0, ${o})`,n.beginPath(),n.ellipse(t,e,Math.max(1,i),Math.max(.5,s),0,0,Math.PI*2),n.fill(),n.restore()}drawObstacles(t,e,i){const s=this.ctx,o=this.biomes.currentBiome.id;if(!this.isRetro)for(const n of t.obstacles)if(n.type==="CACTUS_SMALL"||n.type==="CACTUS_LARGE")this.drawDropShadow(n.x+n.w/2,139,n.w*.42,2.5,.22);else{const r=Math.max(0,140-(n.y+n.h)),a=Math.max(.3,1-r/100),h=Math.max(.04,.16*a);this.drawDropShadow(n.x+n.w/2,139,n.w*.45*a,2*a,h)}for(const n of t.obstacles){let r,a;n.type==="CACTUS_SMALL"?(a=e,!this.isRetro&&n.size===1?o==="canyon"?r="canyon-small":o==="tundra"?r="tundra-small":o==="volcanic"?r="volcanic-small":o==="neon"?r="neon-small":r="cactus-small-1":r=n.size===3?"cactus-small-3":n.size===2?"cactus-small-2":"cactus-small-1"):n.type==="CACTUS_LARGE"?(a=e,!this.isRetro&&n.size===1?o==="canyon"?r="canyon-large":o==="tundra"?r="tundra-large":o==="volcanic"?r="volcanic-large":o==="neon"?r="neon-large":r="cactus-large-1":r=n.size===3?"cactus-large-3":n.size===2?"cactus-large-2":"cactus-large-1"):(a=i,r=n.frame===1?"ptero-2":"ptero-1");const h=this.atlas.getSprite(r,a,n.w,n.h);if(h?s.drawImage(h,n.x,n.y,n.w,n.h):(s.fillStyle=a,s.fillRect(n.x,n.y,n.w,n.h)),this.showHitboxes){s.strokeStyle="#FF0000",s.lineWidth=1;for(const c of n.collisionBoxes)s.strokeRect(n.x+c.x,n.y+c.y,c.w,c.h)}}}drawTrex(t,e){const i=this.ctx,s=t.trex;if(!this.isRetro){const r=Math.max(0,93-s.y),a=Math.max(.32,1-r/110),h=Math.max(.04,.24*a);this.drawDropShadow(s.x+s.w/2,139,s.w*.42*a,2.5*a,h)}let o="trex-idle";t.phase==="CRASHED"?o="trex-dead":s.ducking?o=s.frame===1?"trex-duck2":"trex-duck1":s.jumping?o="trex-run1":t.phase==="RUNNING"||t.phase==="INTRO"?o=s.frame===1?"trex-run2":"trex-run1":o="trex-idle";const n=this.atlas.getSprite(o,e,s.w,s.h);i.save(),!this.isRetro&&!this.reducedEffects&&(this.squashStretchX!==1||this.squashStretchY!==1)&&(i.translate(s.x+s.w/2,s.y+s.h),i.scale(this.squashStretchX,this.squashStretchY),i.translate(-(s.x+s.w/2),-(s.y+s.h))),n?i.drawImage(n,s.x,s.y,s.w,s.h):(i.fillStyle=e,i.fillRect(s.x,s.y,s.w,s.h)),i.restore(),this.showHitboxes&&(i.strokeStyle="#00FF00",i.lineWidth=1,i.strokeRect(s.x,s.y,s.w,s.h))}drawSpeedLines(t){if(this.isRetro||t.speed<9.5||t.phase!=="RUNNING")return;const e=this.ctx;e.save();const i=Math.min(.2,(t.speed-9.5)*.05);e.strokeStyle=`rgba(255, 255, 255, ${i})`,e.lineWidth=1;const s=t.distance*8%600,o=[{y:35,len:45,offset:s*1.5%600},{y:60,len:65,offset:(s*1.8+200)%600},{y:85,len:35,offset:(s*1.2+400)%600},{y:110,len:50,offset:(s*2+100)%600}];for(const n of o){const r=600-n.offset;e.beginPath(),e.moveTo(r,n.y),e.lineTo(r+n.len,n.y),e.stroke()}e.restore()}drawVignette(){if(this.isRetro||this.reducedEffects)return;const t=this.ctx;t.save();const e=this.camera.logicalWidth,i=this.camera.logicalHeight,s=t.createRadialGradient(e/2,i/2,i*.7,e/2,i/2,e*.65);s.addColorStop(0,"rgba(0, 0, 0, 0)"),s.addColorStop(1,"rgba(0, 0, 0, 0.22)"),t.fillStyle=s,t.fillRect(0,0,e,i),t.restore()}}class Qt{jumpPressed=!1;jumpHeld=!1;duckHeld=!1;restartPressed=!1;touchStartY=0;konamiProgress=0;konamiSequence=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","KeyB","KeyA"];onMuteToggle;onRetroToggle;onHitboxToggle;onKonamiCode;constructor(t=window){t.addEventListener("keydown",this.handleKeyDown),t.addEventListener("keyup",this.handleKeyUp),t.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),t.addEventListener("touchend",this.handleTouchEnd,{passive:!1}),t.addEventListener("touchmove",this.handleTouchMove,{passive:!1}),t.addEventListener("touchcancel",this.handleTouchEnd,{passive:!1})}handleKeyDown=t=>{t.key==="F12"||t.ctrlKey&&t.shiftKey&&t.key==="I"||(t.code===this.konamiSequence[this.konamiProgress]?(this.konamiProgress++,this.konamiProgress===this.konamiSequence.length&&(this.konamiProgress=0,this.onKonamiCode?.())):this.konamiProgress=t.code===this.konamiSequence[0]?1:0,t.code==="Space"||t.code==="ArrowUp"||t.code==="KeyW"?(t.preventDefault(),this.jumpHeld||(this.jumpPressed=!0),this.jumpHeld=!0,this.restartPressed=!0):t.code==="ArrowDown"||t.code==="KeyS"?(t.preventDefault(),this.duckHeld=!0):t.code==="Enter"?(t.preventDefault(),this.restartPressed=!0):t.code==="KeyM"?this.onMuteToggle?.():t.code==="KeyR"?this.onRetroToggle?.():t.code==="KeyH"&&this.onHitboxToggle?.())};handleKeyUp=t=>{t.code==="Space"||t.code==="ArrowUp"||t.code==="KeyW"?(t.preventDefault(),this.jumpHeld=!1):(t.code==="ArrowDown"||t.code==="KeyS")&&(t.preventDefault(),this.duckHeld=!1)};isButtonTarget(t){return!!(t&&(t.tagName==="BUTTON"||t.closest?.("button")))}handleTouchStart=t=>{const e=t.target;if(this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),t.touches.length===0))return;const i=t.touches[0];this.touchStartY=i.clientY;const s=document.getElementById("game"),o=s?s.getBoundingClientRect():null;(o?i.clientY>o.top+o.height*.6:i.clientY>window.innerHeight*.6)?(this.duckHeld=!0,this.jumpHeld=!1):(this.jumpPressed=!0,this.jumpHeld=!0,this.restartPressed=!0)};handleTouchMove=t=>{const e=t.target;if(this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),t.touches.length===0))return;t.touches[0].clientY-this.touchStartY>25&&(this.duckHeld=!0,this.jumpHeld=!1)};handleTouchEnd=t=>{const e=t.target;this.isButtonTarget(e)||(t.cancelable&&t.preventDefault(),this.jumpHeld=!1,this.duckHeld=!1)};consume(){const t={jumpPressed:this.jumpPressed,jumpHeld:this.jumpHeld,duckHeld:this.duckHeld,restartPressed:this.restartPressed};return this.jumpPressed=!1,this.restartPressed=!1,t}}class Pt{STEP_MS=1e3/60;MAX_DT=100;game;input;renderer;accumulator=0;lastTime=0;animationFrameId=null;isPaused=!1;constructor(t,e,i){this.game=t,this.input=e,this.renderer=i,document.addEventListener("visibilitychange",this.handleVisibilityChange)}start(){this.animationFrameId===null&&(this.lastTime=performance.now(),this.accumulator=0,this.isPaused=!1,this.animationFrameId=requestAnimationFrame(this.tick))}stop(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}handleVisibilityChange=()=>{document.hidden?this.isPaused=!0:(this.isPaused=!1,this.lastTime=performance.now(),this.accumulator=0)};tick=t=>{if(this.animationFrameId=requestAnimationFrame(this.tick),this.isPaused)return;const e=Math.min(t-this.lastTime,this.MAX_DT);for(this.lastTime=t,this.accumulator+=e;this.accumulator>=this.STEP_MS;){const s=this.input.consume();this.game.step(s,1),this.accumulator-=this.STEP_MS}const i=this.accumulator/this.STEP_MS;this.renderer.draw(this.game.state,i)};destroy(){this.stop(),document.removeEventListener("visibilitychange",this.handleVisibilityChange)}}class w{static memoryStore=new Map;static getItem(t){try{if(typeof window<"u"&&window.localStorage)return window.localStorage.getItem(t)}catch{}return this.memoryStore.get(t)??null}static setItem(t,e){try{if(typeof window<"u"&&window.localStorage){window.localStorage.setItem(t,e);return}}catch{}this.memoryStore.set(t,e)}static getNumber(t,e=0){const i=this.getItem(t);if(i===null)return e;const s=Number(i);return Number.isFinite(s)?s:e}static setNumber(t,e){this.setItem(t,String(e))}static getBoolean(t,e=!1){const i=this.getItem(t);return i===null?e:i==="true"}static setBoolean(t,e){this.setItem(t,e?"true":"false")}}class It{isRetro;isMuted;reducedEffects;showHitboxes;constructor(){this.isRetro=w.getBoolean("dino_retro",!1),this.isMuted=w.getBoolean("dino_muted",!1),this.reducedEffects=w.getBoolean("dino_reduced_effects",!1),this.showHitboxes=!1}toggleRetro(){return this.isRetro=!this.isRetro,w.setBoolean("dino_retro",this.isRetro),this.isRetro}toggleMute(){return this.isMuted=!this.isMuted,w.setBoolean("dino_muted",this.isMuted),this.isMuted}toggleReducedEffects(){return this.reducedEffects=!this.reducedEffects,w.setBoolean("dino_reduced_effects",this.reducedEffects),this.reducedEffects}toggleHitboxes(){return this.showHitboxes=!this.showHitboxes,this.showHitboxes}}class Ot{ctx=null;masterGain=null;isMuted=!1;constructor(t=!1){this.isMuted=t}initContext(){if(typeof window>"u")return null;if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;if(!t)return null;this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=this.isMuted?0:.5,this.masterGain.connect(this.ctx.destination)}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(t){this.isMuted=t,this.masterGain&&this.ctx&&this.masterGain.gain.setValueAtTime(t?0:.5,this.ctx.currentTime)}playJump(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,i=t.createOscillator(),s=t.createGain();i.type="square",i.frequency.setValueAtTime(440,e),i.frequency.exponentialRampToValueAtTime(880,e+.09),s.gain.setValueAtTime(.15,e),s.gain.exponentialRampToValueAtTime(.001,e+.09),i.connect(s),s.connect(this.masterGain),i.start(e),i.stop(e+.095)}playMilestone(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,i=t.createOscillator(),s=t.createGain();i.type="square",i.frequency.setValueAtTime(880,e),s.gain.setValueAtTime(.12,e),s.gain.setValueAtTime(.12,e+.06),s.gain.exponentialRampToValueAtTime(.001,e+.07),i.connect(s),s.connect(this.masterGain),i.start(e),i.stop(e+.075);const o=e+.08,n=t.createOscillator(),r=t.createGain();n.type="square",n.frequency.setValueAtTime(1320,o),r.gain.setValueAtTime(.12,o),r.gain.setValueAtTime(.12,o+.06),r.gain.exponentialRampToValueAtTime(.001,o+.07),n.connect(r),r.connect(this.masterGain),n.start(o),n.stop(o+.075)}playCrash(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,i=t.createOscillator(),s=t.createGain();i.type="square",i.frequency.setValueAtTime(300,e),i.frequency.exponentialRampToValueAtTime(80,e+.22),s.gain.setValueAtTime(.2,e),s.gain.exponentialRampToValueAtTime(.001,e+.22),i.connect(s),s.connect(this.masterGain),i.start(e),i.stop(e+.23);const o=Math.floor(t.sampleRate*.12),n=t.createBuffer(1,o,t.sampleRate),r=n.getChannelData(0);for(let c=0;c<o;c++)r[c]=Math.random()*2-1;const a=t.createBufferSource();a.buffer=n;const h=t.createGain();h.gain.setValueAtTime(.15,e),h.gain.exponentialRampToValueAtTime(.001,e+.12),a.connect(h),h.connect(this.masterGain),a.start(e)}playLand(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,i=t.createOscillator(),s=t.createGain();i.type="sine",i.frequency.setValueAtTime(120,e),i.frequency.exponentialRampToValueAtTime(60,e+.06),s.gain.setValueAtTime(.15,e),s.gain.exponentialRampToValueAtTime(.001,e+.06),i.connect(s),s.connect(this.masterGain),i.start(e),i.stop(e+.065)}playNearMiss(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=t.currentTime,i=t.createOscillator(),s=t.createGain();i.type="triangle",i.frequency.setValueAtTime(600,e),i.frequency.exponentialRampToValueAtTime(200,e+.08),s.gain.setValueAtTime(.08,e),s.gain.exponentialRampToValueAtTime(.001,e+.08),i.connect(s),s.connect(this.masterGain),i.start(e),i.stop(e+.085)}playHighScore(){if(this.isMuted)return;const t=this.initContext();if(!t||!this.masterGain)return;const e=this.masterGain,i=[523.25,659.25,783.99],s=t.currentTime;i.forEach((o,n)=>{const r=s+n*.1,a=t.createOscillator(),h=t.createGain();a.type="sine",a.frequency.setValueAtTime(o,r),h.gain.setValueAtTime(.15,r),h.gain.exponentialRampToValueAtTime(.001,r+.12),a.connect(h),h.connect(e),a.start(r),a.stop(r+.13)})}}class Ht{ctx=null;gainNode=null;noiseNode=null;filterNode=null;isMuted=!1;isRunning=!1;constructor(t=!1){this.isMuted=t}setMuted(t){this.isMuted=t,this.gainNode&&this.ctx&&this.gainNode.gain.setValueAtTime(t?0:.03,this.ctx.currentTime)}start(){if(!(this.isRunning||typeof window>"u"))try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.gainNode=this.ctx.createGain(),this.gainNode.gain.value=this.isMuted?0:.03,this.gainNode.connect(this.ctx.destination),this.filterNode=this.ctx.createBiquadFilter(),this.filterNode.type="lowpass",this.filterNode.frequency.value=400,this.filterNode.connect(this.gainNode);const e=this.ctx.sampleRate*2,i=this.ctx.createBuffer(1,e,this.ctx.sampleRate),s=i.getChannelData(0);let o=0;for(let n=0;n<e;n++){const r=Math.random()*2-1;s[n]=(o+.02*r)/1.02,o=s[n]}this.noiseNode=this.ctx.createBufferSource(),this.noiseNode.buffer=i,this.noiseNode.loop=!0,this.noiseNode.connect(this.filterNode),this.noiseNode.start(),this.isRunning=!0}catch{}}stop(){if(this.noiseNode){try{this.noiseNode.stop()}catch{}this.noiseNode.disconnect(),this.noiseNode=null}this.isRunning=!1}}function D(){const l=document.getElementById("game");if(!l)throw new Error("Canvas element #game not found");const t=new It,e=new Ot(t.isMuted),i=new Ht(t.isMuted),s=new V(l),o=new bt(l,s),n=new Qt(window),r=w.getNumber("dino_high_score",0),a=new _(Date.now(),r);o.isRetro=t.isRetro,o.reducedEffects=t.reducedEffects,o.showHitboxes=t.showHitboxes,o.overlay.updateButtons(t.isMuted,t.isRetro);let h=!1;const c=()=>{h||(h=!0,i.start())};window.addEventListener("keydown",c,{once:!0}),window.addEventListener("touchstart",c,{once:!0}),window.addEventListener("click",c,{once:!0});const p=()=>{const g=a.state.events;for(const m of g)m==="jump"?e.playJump():m==="land"?e.playLand():m==="crash"?(e.playCrash(),w.setNumber("dino_high_score",a.state.highScore)):m==="milestone"?e.playMilestone():m==="nearMiss"?e.playNearMiss():m==="highScore"&&e.playHighScore()},f=()=>{const g=t.toggleMute();e.setMuted(g),i.setMuted(g),o.overlay.updateButtons(g,t.isRetro)};n.onMuteToggle=f,o.overlay.onMuteClick=f;const F=()=>{const g=t.toggleRetro();o.isRetro=g,o.overlay.updateButtons(t.isMuted,g)};n.onRetroToggle=F,o.overlay.onRetroClick=F,n.onHitboxToggle=()=>{o.showHitboxes=t.toggleHitboxes()},n.onKonamiCode=()=>{o.expressions.hasSunglasses=!o.expressions.hasSunglasses,console.log("Easter egg unlocked: Dino Sunglasses!")};const v=new Pt(a,n,o),x=a.step.bind(a);a.step=(g,m=1)=>{x(g,m),p()},v.start(),console.log("Dino Run engine initialized with biomes, skins, ambient audio, and creative layer.")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",D):D();
//# sourceMappingURL=index-C5fl5LkO.js.map
