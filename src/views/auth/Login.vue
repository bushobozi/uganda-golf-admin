<template>
    <div class="login-page bg-light">
        <div class="container">
            <div class="row">
                <div class="col-lg-10 offset-lg-1">
                    <h3 class="mb-3">Welcome back!</h3>
                    <div class="bg-white shadow-sm">
                        <div class="row">
                            <div class="col-md-6 pe-0">
                                <div class="form-left h-100 py-5 px-5">
                                    <form @submit="handleLogin" class="row g-4">
                                        <!-- Error Alert -->
                                        <div v-if="error" class="col-12">
                                            <div class="alert alert-danger" role="alert">
                                                {{ error }}
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <label class="form-label">Email<span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <div class="input-group-text"><i class="bi bi-envelope-fill"></i></div>
                                                <input type="email" v-model="email" class="form-control"
                                                    placeholder="Enter Email" :disabled="loading" required>
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <label class="form-label">Password<span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <div class="input-group-text"><i class="bi bi-lock-fill"></i></div>
                                                <input type="password" v-model="password" class="form-control"
                                                    placeholder="Enter Password" :disabled="loading" required>
                                            </div>
                                        </div>

                                        <div class="col-sm-6">
                                        </div>

                                        <div class="col-sm-6">
                                            <a href="#" @click.prevent="openResetModal"
                                                class="float-end text-primary">Forgot Password?</a>
                                        </div>

                                        <div class="col-12">
                                            <button type="submit" class="btn btn-primary px-4 w-100 mt-4"
                                                :disabled="loading">
                                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"
                                                    role="status"></span>
                                                {{ loading ? 'Signing in...' : 'Login' }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div class="col-md-6 ps-0 d-none d-md-block">
                                <div class="form-right h-100 bg-success text-white text-center pt-5">
                                    <img src="/images/logo.png" style="width: 12rem;" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-end text-secondary mt-3">{{ currentDate }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Password Reset Modal -->
    <div v-if="showResetModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reset Password</h5>
                    <button type="button" class="btn-close" @click="showResetModal = false"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted">Enter your email address and we'll send you a link to reset your password.</p>

                    <!-- Reset Message -->
                    <div v-if="resetMessage" class="alert"
                        :class="resetMessage.includes('sent') ? 'alert-success' : 'alert-danger'" role="alert">
                        {{ resetMessage }}
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Email Address<span class="text-danger">*</span></label>
                        <div class="input-group">
                            <div class="input-group-text"><i class="bi bi-envelope-fill"></i></div>
                            <input type="email" v-model="resetEmail" class="form-control"
                                placeholder="Enter your email address" :disabled="resetLoading" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showResetModal = false"
                        :disabled="resetLoading">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" @click="handlePasswordReset" :disabled="resetLoading">
                        <span v-if="resetLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        {{ resetLoading ? 'Sending...' : 'Send Reset Email' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useFirebaseAuth } from 'vuefire';
import { useRouter } from 'vue-router';

const auth = useFirebaseAuth()!;
const router = useRouter();

const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const resetLoading = ref(false);
const resetMessage = ref('');
const showResetModal = ref(false);
const resetEmail = ref('');

const handleLogin = async (event: Event) => {
    event.preventDefault();

    if (!email.value || !password.value) {
        error.value = 'Please fill in all fields';
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        // Redirect to home page after successful login
        router.push('/');
    } catch (err: any) {
        console.error('Login error:', err);
        switch (err.code) {
            case 'auth/user-not-found':
                error.value = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                error.value = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                error.value = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                error.value = 'Too many failed attempts. Please try again later';
                break;
            default:
                error.value = 'Login failed. Please try again';
        }
    } finally {
        loading.value = false;
    }
};

const handlePasswordReset = async () => {
    if (!resetEmail.value) {
        resetMessage.value = 'Please enter your email address';
        return;
    }

    resetLoading.value = true;
    resetMessage.value = '';

    try {
        await sendPasswordResetEmail(auth, resetEmail.value);
        resetMessage.value = 'Password reset email sent! Check your inbox or spam folder in your email.';
        setTimeout(() => {
            showResetModal.value = false;
            resetEmail.value = '';
            resetMessage.value = '';
        }, 3000);
    } catch (err: any) {
        console.error('Password reset error:', err);
        switch (err.code) {
            case 'auth/user-not-found':
                resetMessage.value = 'No account found with this email address';
                break;
            case 'auth/invalid-email':
                resetMessage.value = 'Invalid email address';
                break;
            default:
                resetMessage.value = 'Failed to send reset email. Please try again.';
        }
    } finally {
        resetLoading.value = false;
    }
};

const openResetModal = () => {
    showResetModal.value = true;
    resetEmail.value = email.value; // Pre-fill with login email if available
    resetMessage.value = '';
};
</script>

<style lang="css" scoped>
a {
    text-decoration: none;
}

.login-page {
    width: 100%;
    height: 100vh;
    display: inline-block;
    display: flex;
    align-items: center;
}

.form-right i {
    font-size: 100px;
}
</style>