<template>
    <div class="card bg-secondary rounded-3 overflow-hidden d-flex flex-column listitem">
        <div class="h-50 w-100">
            <img src="https://media.discordapp.net/attachments/930935059886784532/1029136700083019796/2022-10-1016-59-05_1920x1080.jpg?width=1202&height=676"
                class="card-header p-0 card-image" alt="">
        </div>

        <div class="card-inner bg-dark card-body align-self-end bottom-0 p-0 w-100"
            style="--bs-bg-opacity: 0.75;">
            <div class="p-2 w-100">
                <div class="d-flex flex-row justify-content-between">
                    <h4 class=" ps-1 text-primary">Bin Ich MOD, gugst du!</h4>
                    <div class="text-primary fs-5 ms-1">0.91</div>

                </div>
                <div class="d-flex justify-content-between text-tertiary px-3">
                    <p><i class="bi bi-eye-fill"></i> 23</p>
                    <p><i class="bi bi-download"></i> 16</p>
                    <p><i class="bi bi-hand-thumbs-up-fill"></i> 8</p>
                </div>
                <p class="card-text px-2">Hier könnte die beschreibung deiner Mod stehen! <br>Wieso tut sie das noch nicht ?!?!</p>
            </div>
        </div>
        <div class="card-footer bg-dark d-flex flex-row flex-wrap justify-content-between pb-2">
            <div class="text-muted">by <a class="text-primary">@anonymous</a></div>
            <div class="text-muted">version <a class="text-primary">0.0.1</a></div>
            <div class="text-muted">updated <a class="text-primary">1 sec ago</a></div>
        </div>
    </div>
</template>
<script setup>



</script>
<style scoped>
.listitem {
    max-width: 30rem;
    min-width: 15rem;
    width: 30rem;
    font-size: smaller;
}

.card-image {
    width: 100%;
    height: calc(100% + 2.35rem);
    object-fit: cover;
}

.card-inner {
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(4px);
    height: fit-content;
}
</style>