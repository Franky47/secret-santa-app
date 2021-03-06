<template>
    <div class='wrapper'>
        <h1>{{ $t('auth.createNewAccount') }}</h1>
        <form @submit.prevent='register' class='ui form' :class='{error: errorMessage}'>
            <email :value.sync='user.email' :show-errors='showErrors' v-ref:email required></email>
            <password :value.sync='user.password' :show-errors='showErrors' v-ref:password instructions required></password>
            <name :value.sync='user.name' :show-errors='showErrors' v-ref:name required></name>
            <avatar v-ref:avatar :user-name='user.name'></avatar>
            <div class='ui error message'>
                <div class='header'>Error</div>
                <p>{{errorMessage}}</p>
            </div>
            <button class='ui basic green fluid--mobile large--mobile button' :class='{loading: loading}' type='submit'>
                <i class='fitted add user icon'></i> {{ $t('auth.createAccount') }}
            </button>
        </form>
    </div>
</template>

<script>
import Avatar               from '../../components/form/Avatar'
import Email                from '../../components/form/Email'
import Password             from '../../components/form/Password'
import Name                 from '../../components/form/Name'
import store                from '../../vuex/store'
import * as auth            from '../../vuex/modules/auth'
import { home }             from '../../router/routes-definitions'
import { uploadUserAvatar } from '../../api/storage/user'

export default {
    data: () => ({
        showErrors: false,
        loading: false,
        user: {
            email: '',
            password: '',
            name: ''
        },
        errorMessage: ''
    }),
    components: { Email, Password, Name, Avatar },
    computed: {
        validation() {
            const email     = this.$refs.email    || { valid: false }
            const password  = this.$refs.password || { valid: false }
            const name      = this.$refs.name     || { valid: false }
            return {
                name:       name.valid,
                email:      email.valid,
                password:   password.valid
            }
        },
        isValid() {
            const validation = this.validation
            return Object.keys(validation).every((key) => validation[key])
        },
        avatarLetter() {
            return (this.user.name.trim()[0] || '').toUpperCase()
        }
    },
    methods: {
        register() {
            if (!this.isValid) {
                this.showErrors = true
                return
            }
            this.loading = true
            let userId = null
            this.registerWithEmail(this.user.email, this.user.password)
                .then(user => {
                    userId = user.uid // Save it for later
                    // Render the cropped image to a virtual file
                    return this.$refs.avatar.getImageAsFile()
                })
                .then(file => {
                    return uploadUserAvatar(userId, file).catch(error => {
                        console.log(error)
                        return Promise.resolve(null)
                    })
                })
                .then(uploadResult => {
                    const profile = {
                        // Provide fallback in case upload failed.
                        photoURL:   'https://gravatar.com/avatar?d=mm&s=320',
                        displayName: this.user.name
                    }
                    if (uploadResult) {
                        profile.photoURL = uploadResult.downloadURL
                    }
                    return this.updateUserProfile(profile)
                }).then(() => {
                    this.loading = false
                    this.reset()
                    this.$router.go(home)
                }).catch((error) => {
                    this.loading = false
                    this.errorMessage = error.message
                })
        },
        reset() {
            this.showErrors = false
            this.user.email = ''
            this.user.password = ''
            this.user.name = ''
            this.errorMessage = ''
        }
    },
    vuex: {
        actions: {
            registerWithEmail:      auth.actions.registerWithEmail,
            updateUserProfile:      auth.actions.updateUserProfile
        }
    },
    route: {
        canActivate() {
            // We don't have access to `this` here.
            return !auth.getters.isSignedIn(store.state)
        }
    }
}
</script>

<style scoped>
.wrapper {
    max-width: 450px;
    min-width: 292px;
    margin: 50px auto;
    padding-bottom: 50px;
}
</style>
