<template>
    <div class='field'>
        <label>{{ label }}</label>
        <div class='ui large--mobile fluid search dropdown selection' @click='this.menuVisible = !this.menuVisible' :class='dropDownClass'>
            <select class='ui compact dropdown'>
                <option v-for='opt in optionKeys' :value='opt'>{{ options[opt] }}</option>
            </select>
            <i class='dropdown icon'></i>
            <div class='text'>{{ options[value] }}</div>
            <div class='menu transition' tabindex='-1' :class='menuClass'>
                <div v-for='opt in optionKeys' class='item' :data-value='opt' @click='value = opt'>{{ options[opt] }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: () => ({
        menuVisible: false
    }),
    props: {
        label: {
            type: String,
            default: 'Select',
            required: true
        },
        options: {
            type: Object,
            default: () => ({}),
            required: true
        },
        defaultText: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            required: true,
            twoWay: true
        }
    },
    computed: {
        dropDownClass() {
            return {
                visible: this.menuVisible,
                active:  this.menuVisible
            }
        },
        menuClass() {
            return {
                visible: this.menuVisible,
                hidden: !this.menuVisible
            }
        },
        optionKeys() {
            return Object.keys(this.options)
        }
    }
}
</script>
