import page1 from '../mock/page1';
import page2 from '../mock/page2';
import page3 from '../mock/page3';
import page4 from '../mock/page4';
import page5 from '../mock/page5';
let page = {
    '1': page1,
    '2': page2,
    '3': page3,
    '4': page4,
    '5': page5
};
export function ajaxMixin(LightArt) {
    LightArt.prototype.pageIndex = 1;
    LightArt.$ajax = LightArt.prototype.$ajax = function(options) {
        if (options.showLoading) {
            wx.showLoading({ title: '加载中' });
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.pageIndex <= 5) {
                    resolve(page[this.pageIndex]);
                } else {
                    reject({});
                }
                this.pageIndex++;
            }, 400);
        });
    };
}
