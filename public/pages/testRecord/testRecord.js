import regeneratorRuntime from '../../utils/regenerator-runtime';
const recorderManager = require('../../utils/recorderManager');

const options = {
    duration: 10000,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'aac',
    frameSize: 1000
};

Page({
    data: {
        
    },

    onShow() {
        this.recorderManager = recorderManager({
            startEvent: () => {},
            stopEvent: async () => {
                await new Promise((resolve, reject) => {
                    resolve();
                }).catch(err => {
                    console.log(err);
                });
            }
        });
    },

    startRecord() {
        this.recorderManager.start(options)
    },

    stopRecord() {
        this.recorderManager.stop()
    }
    
})