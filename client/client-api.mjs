class ClientAPI {
    constructor(client){
        this.client = client;
        this.state = {
            loading: true
        }
    }

    init(){
        this.getInitialState().then(state => {
            this.state = state?.data ?? {error: state};
            this.state.loading = false;
            this.client.app.state = this.state;
        }).catch(err => {
            this.state = {error:err}
        })
    }

    getInitialState(){
        return axios.get('/api/state');
    }
}

export default ClientAPI;