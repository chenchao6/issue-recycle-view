/**
 * 处理曝光埋点
 */
export function Exposure(node) {
    if (node && node.statistics && node.statistics.expose) {
        let exposure ={};
        let wx_expose = {};
        if(node.business && node.business.type){
            switch (node.business.type){
                case 'mst_main':  // 专题
                case 'brand_main': // 档期
                    // console.log(node);
                    let brandId = node.business.brand_id || node.business.special_id;
                    let brandType = node.business.brand_type;
                    // 小程序资源埋点
                    wx_expose.h = `ht=brand`;
                    wx_expose.c = `tt=brand&ti=${brandId}&bt=${brandType}`;
                    // 小程序曝光时间，这个值会自动计算
                    wx_expose.p = 't=1000';
                    wx_expose.e = '';
                    exposure = {
                        id: brandId,
                        data: JSON.stringify(wx_expose),
                        // row:row,
                        col:1, // 档期位暂时写死1，只有一列
                        className: ' expose-item' // 目前小程序曝光埋点框架需要追加expose-item样式进行统一曝光
                    };
                    // console.log(exposure)
                    break;
                case 'pcmp': // PCMP楼层
                    const _expose = node.statistics.expose;
                    const objData = _expose.obj_data || '';
                    // PCMP楼层ID
                    let pcmp_id = '';
                    // PCMP楼层slot_id
                    let slot_id = '';
                    let args;
                    if (objData) {
                        args = /id=(.*)&sub_sn=(.*)&?/.exec(objData);
                        if (args && args.length > 2) {
                            pcmp_id = args[1];
                            slot_id = args[2];
                        }
                    }
                    // let row = '1';
                    // 小程序资源埋点
                    wx_expose.h = `ht=floor&hi=${pcmp_id}`;
                    wx_expose.c = `${decodeURIComponent(_expose.biz_data || '')}`;
                    // 小程序曝光时间，这个值会自动计算
                    wx_expose.p = 't=1000';
                    wx_expose.e = `${decodeURIComponent(_expose.ext_data || '')}`;
                    // pcmp楼层内slot_id
                    let col = slot_id;
                    exposure = {
                        id: _expose.obj_id || '',
                        data: JSON.stringify(wx_expose),
                        // row:row,
                        col:col,
                        className: ' expose-item' // 目前小程序曝光埋点框架需要追加expose-item样式进行统一曝光
                    };
                    // console.log(exposure)

                    break;
                default:
                    // console.log(node);
                    break;
            }
            this.setData({
                exposure
            });
        }
    }
}
