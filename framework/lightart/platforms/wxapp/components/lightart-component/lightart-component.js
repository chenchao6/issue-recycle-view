import componentBehavior from '../component-behavior';
import LightArt from '../../entry';
import { Exposure } from '../exposure';
Component({
    behaviors: [componentBehavior],
    properties: {
        lightartId: Number,
        lightartRow: Number,
        node: Object
    },
    attached() {
        // 记录组件id->组件的引用关系、方便局部更新
        const lightart = LightArt.get(this.data.lightartId);
        if (!lightart) {
            console.error(
                `the lightartId:${
                    this.data.lightartId
                } get undefined in lightart-component`
            );
            return;
        }
        Exposure.call(this, this.data.node);
        lightart._addCompoent(this.data.node.id, this);
    },
    detached() {
        // 不继续保存组件引用
        const lightart = LightArt.get(this.data.lightartId);
        lightart._removeCompoent(this.data.node.id);
    },
    methods: {
        onTap(e) {
            // console.log(e, this.data);
            const lightart = LightArt.get(this.data.lightartId);
            const actions = this.data.node.actions;
            const statistics = this.data.node.statistics;
            if (actions && actions.click) {
                lightart.$action(actions.click);
            }
            if (statistics && (statistics.click || statistics.expose)) {
                lightart.$statistic('click', statistics, {
                    row: this.data.lightartRow
                });
            }
        }
    }
});
