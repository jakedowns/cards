class OS {
    focused_deck = null;
    focused_card = null;

    constructor(){
        this.boot();
    }

    boot(){
        this.loadStorage();
    }

    loadStorage(){
        // indexeddb ? websql ? api ?
        
    }
}