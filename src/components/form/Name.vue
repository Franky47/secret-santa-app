<template>
    <div class='field' :class='{error: !valid && showErrors, required: required}'>
        <label>{{ $t('form.name') }} <span v-if='!valid && showErrors'>{{ $t('form.validation.isRequired') }}</span></label>
        <input v-model='value' type='text' :placeholder='placeholder' class='large--mobile'>
    </div>
</template>

<script>
import Vue from 'vue'
export default {
    data: () => ({

    }),
    computed: {
        valid() {
            return !!this.value.trim()
        }
    },
    props: {
        value: {
            type: String,
            default: '',
            twoWay: true
        },
        placeholder: {
            type: String,
            default: () => Vue.t('eg') + ': Santa Claus'
        },
        showErrors: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false
        }
    }
}
</script>
