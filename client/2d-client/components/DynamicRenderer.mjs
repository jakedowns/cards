export default {
    functional: true,
    props: {
      body: String,
      data: { type: Object, default: () => ({}) },
    },
    render(h, context, props) {
      const template = `<div>${props?.body}</div>`

      const dynComponent = {
        // components:{SmartLink},
        template,
        data() { return props?.data },
      }
      return Vue.h(dynComponent);
    }
  }