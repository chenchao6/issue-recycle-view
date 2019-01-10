const storage = require('../utils/storage.js');
import indexData from './mock/index';
/**
 * 获取数据
 * @param {*} params
 * @param {*} success
 * @param {*} fail
 */
function getData(params, success, fail) {
    // getLightArtData({
    //     ...params,
    //     ...exports.getLightMoreDataParams()
    // })
    //     .then(res => {
    //         const data = res && res.data && res.data.data && res.data.data.data;
    //         if (!data) {
    //             fail && fail();
    //         }
    //         const datas = {
    //             body: data
    //         };
    //         let endTime = new Date().getTime();
    //         console.log('get data 接口耗时： ' + (endTime - startTime) + 'ms');
    //         success && success(datas);
    //     })
    //     .catch(() => {
    //         fail && fail();
    //     });
    success({
        body: indexData.data.data
    });
}
/**
 *
 * 获取更多数据 通用参数
 */
exports.getLightMoreDataParams = function() {
    return {};
};

/**
 * 获取模板和数据
 * @param {*} params
 */
export function getTemplateAndData(params) {
    return new Promise((resolve, reject) => {
        const temValue =
            storage.get('lightart_identifyCode') ||
            '{"body":{"dt":"section_list","sticky_header":"false","component_id":"floor_list_id","content_insets":{"l":"0","t":"0","r":"0","b":"0"},"safe_areas":{"b":"{{$screen.safe_areas.b}}"},"load_more":{"url":"https://wxapi.appvipshop.com/vips-mobile/rest/layout/wap/channel/data","method":"{{#? url_load_method}}","token":"{{#? load_more_token}}","hide_when_done":"true","preload":"10","view":{"dt":"native","name":"vs_load_more","bounds":{"w":"100%","h":"100dip"},"params":{"component_id":"floor_list_id"}}},"refresh":{"url":"{{#? refresh_url}}","method":"{{#? url_load_method}}","view":{"dt":"native","name":"vs_refresh","bounds":{"w":"100%"},"params":{"component_id":"floor_list_id","full_screen":"true"}}},"bounds":{"t":"0","l":"0","w":"750dip","h":"100%"},"background":{"color":"#F3F4F5"},"sections":{"{{#each floor_list}}":[{"{{#if floor_type == \'pcmp\'}}":{"components":[{"component_id":"{{#? unique_id}}","dt":"block","bounds":{"w":"{{#? data.bounds.w}}","h":"{{#? data.bounds.h}}"},"background":{"image":{"url":"{{#? data.backGroundImage}}"},"color":"{{#? data.backGroundColor}}"},"components":{"{{#each data.resourceGroupList}}":{"dt":"block","bounds":{"w":"{{#? bounds.w}}","h":"{{#? bounds.h}}","l":"{{#? bounds.l}}","t":"{{#? bounds.t}}"},"actions":{"click":{"name":"!href","params":{"url":"{{#? action.href}}"}}},"statistics":{"click":"{{#? action.burypoint}}","expose":"{{#? action.burypoint}}"},"business":{"type":"pcmp"},"components":{"{{#each resourceList}}":[{"{{#if dataType == \'image\' && lightArtImage.imageUrl == \'\'}}":{"dt":"block","background":{"color":"{{#? lightArtImage.backGroundColor}}"},"bounds":{"w":"{{#? lightArtImage.bounds.w}}","h":"{{#? lightArtImage.bounds.h}}","l":"{{#? lightArtImage.bounds.l}}","t":"{{#? lightArtImage.bounds.t}}"},"corner_radius":{"lt":"{{#? lightArtImage.cornerRadius.lt}}","lb":"{{#? lightArtImage.cornerRadius.lb}}","rt":"{{#? lightArtImage.cornerRadius.rt}}","rb":"{{#? lightArtImage.cornerRadius.rb}}"},"actions":{"click":{"name":"!href","params":{"url":"{{#? lightArtImage.action.href}}"}}},"statistics":{"click":"{{#? lightArtImage.action.burypoint}}","expose":"{{#? lightArtImage.action.burypoint}}"},"business":{"type":"pcmp"},"z_index":"{{#? lightArtImage.zindex}}","index":"{{$index}}"}},{"{{#elseif dataType == \'image\'}}":{"dt":"image","url":"{{lightArtImage.imageUrl}}","default_url":"{{#? lightArtImage.defaultUrl}}","error_url":"{{#? lightArtImage.errorUrl}}","scale_type":"{{#? lightArtImage.scaleType}}","background":{"color":"{{#? lightArtImage.backGroundColor}}"},"bounds":{"w":"{{#? lightArtImage.bounds.w}}","h":"{{#? lightArtImage.bounds.h}}","l":"{{#? lightArtImage.bounds.l}}","t":"{{#? lightArtImage.bounds.t}}"},"corner_radius":{"lt":"{{#? lightArtImage.cornerRadius.lt}}","lb":"{{#? lightArtImage.cornerRadius.lb}}","rt":"{{#? lightArtImage.cornerRadius.rt}}","rb":"{{#? lightArtImage.cornerRadius.rb}}"},"actions":{"click":{"name":"!href","params":{"url":"{{#? lightArtImage.action.href}}"}}},"statistics":{"click":"{{#? lightArtImage.action.burypoint}}","expose":"{{#? lightArtImage.action.burypoint}}"},"business":{"type":"pcmp"},"z_index":"{{#? lightArtImage.zindex}}","index":"{{$index}}"}},{"{{#elseif dataType == \'countDown\'}}":{"dt":"countdown","bounds":{"w":"{{#? lightArtCountDown.bounds.w}}","h":"{{#? lightArtCountDown.bounds.h}}","l":"{{#? lightArtCountDown.bounds.l}}","t":"{{#? lightArtCountDown.bounds.t}}"},"z_index":"99","start_time":"{{#? lightArtCountDown.startTime}}","end_time":"{{#? lightArtCountDown.endTime}}","components":[{"dt":"flow","direction":"horizontal","layout_align":{"v":"center","h":"center"},"components":[{"dt":"label","text":"{{ $countdown.hour }}","font":{"size":"22","color":"#ffffff"},"background":{"color":"#000000"},"align":{"v":"center","h":"center"}},{"dt":"label","text":":","font":{"size":"18","color":"#000000"},"bounds":{"w":"10"},"align":{"v":"center","h":"center"}},{"dt":"label","text":"{{ $countdown.minute }}","font":{"size":"22","color":"#ffffff"},"background":{"color":"#000000"},"align":{"v":"center","h":"center"}},{"dt":"label","text":":","font":{"size":"18","color":"#000000"},"bounds":{"w":"10"},"align":{"v":"center","h":"center"}},{"dt":"label","text":"{{ $countdown.second }}","font":{"size":"22","color":"#ffffff"},"background":{"color":"#000000"},"align":{"v":"center","h":"center"}}]}]}},{"{{#elseif dataType == \'label\'}}":{"dt":"label","text":"{{#? lightArtLabel.text}}","font":{"size":"{{#? lightArtLabel.fontSize}}","color":"{{#? lightArtLabel.fontColor}}"},"bounds":{"w":"{{#? lightArtLabel.bounds.w}}","h":"{{#? lightArtLabel.bounds.h}}","l":"{{#? lightArtLabel.bounds.l}}","t":"{{#? lightArtLabel.bounds.t}}"},"corner_radius":{"lt":"{{#? lightArtLabel.cornerRadius.lt}}","lb":"{{#? lightArtLabel.cornerRadius.lb}}","rt":"{{#? lightArtLabel.cornerRadius.rt}}","rb":"{{#? lightArtLabel.cornerRadius.rb}}"},"align":{"h":"{{#? lightArtLabel.align}}","v":"{{#? lightArtLabel.align}}"},"actions":{"click":{"name":"!href","params":{"url":"{{#? lightArtLabel.action.href}}"}}},"background":{"color":"{{#? lightArtLabel.backGroundColor}}"},"strikethrough":"{{#? lightArtLabel.strikethrough}}","statistics":{"click":"{{#? lightArtLabel.action.burypoint}}","expose":"{{#? lightArtLabel.action.burypoint}}"},"business":{"type":"pcmp"},"z_index":"{{#? lightArtLabel.zindex}}","index":"{{$index}}","max_lines":"{{#? lightArtLabel.maxLines}}"}}]}}}}]}},{"{{#elseif floor_type == \'ads\'}}":{"components":[{"component_id":"{{#? unique_id}}","dt":"native","name":"vs_ads_scroller","bounds":{"w":"750dip"},"params":"{{data.ad_data}}"}]}},{"{{#elseif floor_type == \'mo\'}}":{"components":[{"component_id":"{{#? unique_id}}","dt":"native","name":[{"{{#if data.type == 1}}":"vs_mo_normal_view"},{"{{#elseif data.type == 2}}":"vs_mo_scroll_view"},{"{{#elseif data.type == 3}}":"vs_mo_group_view"}],"bounds":{"w":"750dip"},"params":"{{data.operation_data}}"}]}},{"{{#elseif floor_type == \'separator\'}}":{"content_insets":{"l":"","t":"","r":"","b":""},"components":[{"dt":"block","background":{"color":""},"bounds":{"w":"100%","h":"115dip"},"align":{"h":"center","v":"center"},"components":[{"dt":"label","bounds":{"w":"100%","h":"100%"},"text":"{{#? data.text}}","font":{"size":"30","color":"#222222","name":"PingFangSC-Medium","bold":"true","line_height":"115dip"},"align":{"h":"center","v":"center"},"z_index":"1"},{"dt":"image","url":"{{#? data.image}}","bounds":{"w":"100%","h":"115dip"},"scale_type":"fill"}]}]}},{"{{#elseif floor_type == \'brand\'}}":{"components":[{"component_id":"{{#? unique_id}}","bounds":{"w":"750dip","h":"493dip"},"dt":"native","name":"vs_brand","params":"{{data.brand}}","statistics":{"click":"{{#? data.brand.st_ctx_click}}","expose":"{{#? data.brand.st_ctx_click}}"},"business":"{{#? data.brand.wormhole}}"}]}},{"{{#elseif floor_type == \'mst\'}}":{"components":[{"component_id":"{{#? unique_id}}","dt":"native","bounds":{"w":"750dip","h":"361dip"},"name":"vs_mst","params":"{{data.special}}","statistics":{"click":"{{#? data.special.st_ctx_click}}","expose":"{{#? data.special.st_ctx_click}}"},"business":"{{#? data.special.wormhole}}"}]}}]}}}';

        const templates = JSON.parse(temValue);
        getData(
            params,
            datas => {
                resolve({ templates, datas });
            },
            () => {
                reject();
            }
        );
    });
}
export function getInitLightArtConf() {
    return {
        onHref: function(href) {},
        onStatistic: function(type, statistic, opt) {}
    };
}
