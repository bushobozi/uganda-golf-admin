<template>
    <div class="grid">
        <div class="d-flex flex-column align-items-center justify-content-center">
            <div class="text-center">
                <h1 class="display-1 fw-bold">404</h1>
                <p class="fs-3"> <span class="text-danger">Opps!</span> Page not found.</p>
                <p class="lead">
                    The page you’re looking for doesn’t exist.
                </p>
                <RouterLink to="/" class="btn btn-primary"><i class="bi bi-arrow-left-circle"></i> Previous Page
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { defineComponent } from 'vue';

defineComponent({
    name: 'Error404'
});

</script>

<style lang="css" scoped>
.grid {
    background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: grid;
    place-items: center;
    min-height: 100vh;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}
</style>
