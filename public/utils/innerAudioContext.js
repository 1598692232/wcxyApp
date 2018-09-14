import regeneratorRuntime from './regenerator-runtime';

/*
* 录音封装接口
*
*/

const innerAudioContext = (opt = {
    playEvent: () => {}, 
    endEvent: () => {},
    canplayEvent: () => {}
}) => {
    let iac = wx.createInnerAudioContext();

    // 播放结束
    iac.onEnded(() => {
        opt.endEvent();
    });

    // 可以开始播放事件
    iac.onCanplay(() => {
        console.log('可以开始播放');
        opt.canplayEvent();
    });

    // 播放事件
    iac.onPlay(() => {
        console.log('播放事件');
        opt.playEvent();
    });

    return iac;
}

module.exports = innerAudioContext;

