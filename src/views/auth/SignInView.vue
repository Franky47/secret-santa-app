<template>
    <div id='wrapper' class='ui padded raised segment' :class='{loading: loading}'>
        <button @click='facebookSignIn' class='ui fluid large-on-desktop facebook button'>
            <i class='facebook icon'></i>
            {{ $t('auth.signInWithFacebook') }}
        </button>
        <div class='ui horizontal divider'>{{ $t('or') }}</div>
        <form @submit.prevent='emailSignIn' class='ui form' :class='{error: errorMessage}'>
            <email :value.sync='user.email' :show-errors='showErrors' v-ref:email></email>
            <password :value.sync='user.password' :show-errors='showErrors' v-ref:password></password>
            <button class='ui fluid blue button' type='submit'>
                <i class='fitted icon sign in'></i> {{ $t('auth.signIn') }}
            </button>
            <div class='field centered text padded'>
                <a v-link='{ path: routes.auth.passwordReset.request }'>
                    {{ $t('auth.forgotPassword') }}
                </a>
            </div>
            <div class='ui error message'>
                <div class='header'>Error</div>
                <p>{{errorMessage}}</p>
            </div>
        </form>
        <div class='ui divider'></div>
        <div class='centered text'>
            <a v-link='{ path: routes.auth.register }'>
                {{ $t('auth.register')}}
            </a>
        </div>
    </div>
</template>

<script>
import Email        from '../../components/form/Email'
import Password     from '../../components/form/Password'
import * as auth    from '../../vuex/modules/auth'
import * as routes  from '../../router/routes-definitions'
import store        from '../../vuex/store'

export default {
    data: () => ({
        user: {
            email: '',
            password: ''
        },
        loading: false,
        errorMessage: '',
        routes
    }),
    components: { Email, Password },
    methods: {
        facebookSignIn() {
            this.loading = true
            this.signInWithFacebook()
                .catch(error => {
                    this.loading = false
                    this.errorMessage = error.message
                })
        },
        emailSignIn() {
            const email = this.user.email.trim()
            const password = this.user.password.trim()
            // todo: check route args to see if reauth or sign-in.
            this.signInWithEmail(email, password).then(() => {
                this.reset()
                this.handleRedirect()
            }).catch(error => {
                this.loading = false
                this.errorMessage = error.message
            })
            this.loading = true
        },
        reset() {
            this.errorMessage   = ''
            this.user.email     = ''
            this.user.password  = ''
            this.loading        = false
        },
        handleRedirect() {
            let redirect = null
            if (this.$router.query) {
                redirect = this.$router.query.next
            }
            if (redirect) {
                this.$router.go({ path: redirect })
            } else {
                this.$router.go(routes.home)
            }
        }
    },
    vuex: {
        getters: {
            isSignedIn:             auth.getters.isSignedIn
        },
        actions: {
            signInWithFacebook:     auth.actions.signInWithFacebook,
            signInWithEmail:        auth.actions.signInWithEmail,
            signOut:                auth.actions.signOut
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

<style scoped lang='scss'>
#wrapper {
    max-width: 450px;
    min-width: 280px;
    margin: 130px auto;
    padding-bottom: 23px;
}
.centered.text {
    text-align: center;
}
.padded {
    padding-top: 12px;
}

@media only screen and (min-width: 480px) {
    .large-on-desktop {
        font-size: 1.14286rem;
    }
}

</style>
