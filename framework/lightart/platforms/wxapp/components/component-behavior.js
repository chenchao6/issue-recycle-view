// export default Behavior({
//     behaviors: [],
//     properties: {
//     },
//     data: {
//     },
//     attached: function(){},
//     methods: {
//     }
// })
export default Behavior({
    properties: {
        // 生命周期
        lifeHookType: {
            type: String,
            observer: 'updateLife',
            value: '',
        },
    },

    methods: {
        /**
         * 父类更新子控件生命周期
         * @param type
         */
        updateLife(type, ...opts) {
            type && this[type] && this[type](...opts);
        },
    },
});
