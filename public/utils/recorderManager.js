import regeneratorRuntime from './regenerator-runtime';

/*
* 录音封装接口
*
*/

const recorderManager = (opt = {
    startEvent: () => {}, 
    stopEvent: () => {}
}) => {
    let recorderManager = wx.getRecorderManager();

    recorderManager.onFrameRecorded((res) => {
        const { frameBuffer } = res;
    });

    // 开始录音事件
    recorderManager.onStart(() => {
        opt.startEvent();
    });

    // 停止录音事件
    recorderManager.onStop(async (res) => {
        const { tempFilePath } = res;
        await opt.stopEvent(tempFilePath, res);
    });
    
    return recorderManager;
};

module.exports = recorderManager;