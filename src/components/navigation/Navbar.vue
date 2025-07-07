<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light p-2">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src="/images/logo.png" alt="logo png" style="width: 4rem;" />
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                    </ul>
                    <div class="d-flex gap-3 align-items-center">
                        <span class="bg-white rounded-4 p-2 shadow-sm border">{{ currentUser?.email }}</span>
                        <button class="btn btn-success rounded-4" @click="logout">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<script lang="ts" setup>
// logout
import { useFirebaseAuth, useCurrentUser } from 'vuefire';
import { useRouter } from 'vue-router';

const auth = useFirebaseAuth()!;
const router = useRouter();

// current user
const currentUser = useCurrentUser();

const logout = async () => {
    await auth.signOut();
    router.push('/login');
};
</script>