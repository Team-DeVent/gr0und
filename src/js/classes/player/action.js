class Action {
    constructor (self) {
        this.self = self
    }


    start(uid) {
        console.log(this)
        const settings = this.self.player.baseActions[uid][ 'walk' ];
        const currentSettings = this.self.player.baseActions[uid][ 'idle' ];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;
        console.log("> >>", currentAction, action)
        this.prepareCrossFade( currentAction, action, 0.25, uid);
    }
    
    stop(uid) {
        const settings = this.self.player.baseActions[uid][ 'idle' ];
        const currentSettings = this.self.player.baseActions[uid][ 'walk' ];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;
        this.prepareCrossFade( currentAction, action, 0.25, uid);
    }


    
    activate(action, uid) {
        console.log(this.self.handle.player.action)
        const clip = action.getClip();
        const settings = this.self.player.baseActions[uid][ clip.name ] || this.self.player.additiveActions[ clip.name ];
        this.self.handle.player.object.setWeight( action, settings.weight );
        action.play();
    }

    
    addBaseActions(player) {
        this.self.player.baseActions[player] = {
          idle: { weight: 1 },
          walk: { weight: 0 },
          run: { weight: 0 }
        }
    }

    prepareCrossFade( startAction, endAction, duration, player ) {

        // 현재 동작이 '유휴'인 경우 크로스페이드(crossfade)를 즉시 실행합니다;
        // 그렇지 않으면 현재 작업이 현재 루프를 완료할 때까지 기다립니다.
        if ( this.self.player.currentBaseAction === 'idle' || ! startAction || ! endAction ) {
            this.executeCrossFade( startAction, endAction, duration, player );
        } else {
            this.synchronizeCrossFade( startAction, endAction, duration, player );
        }
      
        // Update control colors
        if ( endAction ) {
            const clip = endAction.getClip();
            this.self.player.currentBaseAction = clip.name;
        } else {
            this.self.player.currentBaseAction = 'None';
        }
      
        this.self.player.crossFadeControls.forEach( function ( control ) {
            const name = control.property;
            if ( name === currentBaseAction ) {
                control.setActive();
            } else {
                control.setInactive();
            }
        });
    }
      



    synchronizeCrossFade(startAction, endAction, duration, player) {
        let onLoopFinished = ( event ) => {
            if ( event.action === startAction ) {
                this.self.mixer[player].removeEventListener( 'loop', onLoopFinished );
                this.executeCrossFade( startAction, endAction, duration, player );
            }
        }
        this.self.mixer[player].addEventListener( 'loop', onLoopFinished );

    }
    
    
  
    executeCrossFade(startAction, endAction, duration, player) {
        // 시작 동작뿐만 아니라 종료 동작도 페이딩 전에 1의 가중치를 얻어야 합니다.
        // (이 플레이스에서 이미 보장된 시작 동작과 관련하여)
        //console.log("executeCrossFade",startAction, endAction)
    
        if (endAction) {
            this.self.handle.player.object.setWeight( endAction, 1 );
            endAction.time = 0;
        
            if (startAction) {  // Crossfade with warping
                startAction.crossFadeTo( endAction, duration, true );
            } else {  // Fade in
                endAction.fadeIn( duration );
            }
        } else {  // Fade out
            startAction.fadeOut( duration );
        }
    }
}

export { Action }