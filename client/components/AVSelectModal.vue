<template>
    <div>
        <!-- TODO -->
        <h3>Select your A/V options</h3>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Audio</label>
                    <select class="form-control" v-model="selectedAudio">
                        <option v-for="audio in audioOptions" :value="audio.id">{{ audio.name }}</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Video</label>
                    <select class="form-control" v-model="selectedVideo">
                        <option v-for="video in videoOptions" :value="video.id">{{ video.name }}</option>
                    </select>
                </div>
            </div>
        </div>
        <!-- mute mic -->
        <!-- mute video -->
        <div class="row">
            <div class="col-md-12">
                <button class="btn btn-primary" @click="select">Select</button>
            </div>
        </div>
    </div>
</template>