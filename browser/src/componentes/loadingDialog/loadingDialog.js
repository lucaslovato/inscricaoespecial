export default {
    data() {
        return {
            active: false
        }
    },
    methods: {
        openDialog() {
            console.log('chegou aqui', this);
            this.active = true;
        },
        closeDialog() {
            this.active = false;
        }
    }
}