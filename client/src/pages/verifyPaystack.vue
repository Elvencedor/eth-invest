<template>
    <Modal>
      <div slot="title">Verify payment</div>
      <div slot="content">
        <span class="text-red-500 bg-red-300 p-3 rounded">Click on the button below to verify your payment.</span>
      </div>
      <div slot="footer">
        <button @click="verify" :disabled="verifyBtn.make" class="w-full p-3 bg-green-500 text-white hover:bg-green-600 rounded">
            <span v-if="verifyBtn.make" class="fas fa-spinner fa-spin"></span>
            <span v-else>click to Verify your payment. </span>          
        </button>
      </div>
    </Modal>
</template>

<script>
import Vue from 'vue'
import izitoast from 'izitoast'
import axios from 'axios'
// import { mapActions } from 'vuex'
import Modal from '@/components/main/utils/Modal'
import mixins from '../mixins'
import VueSession from 'vue-session'
import * as paystack from 'paystack'
const paystackService = paystack('sk_test_e62d31faaf67d3af0108224046b2c3de72ccbb9c')

Vue.use(VueSession)

export default {
    name: 'verify',
    mixins: [mixins],
    components: {
        Modal
    },

    data () {
        return {
            paystackData: [],
            verifyBtn: {
                make: false
            },
            form: {
                amount: this.$session.get('amount'),
                reference: this.$session.get('reference-key')
            }
        }
    },

    computed: {
        console: () => console
    },

    methods: {
        async verify() {
            this.verifyBtn.make = true
            
            try{
                paystackService.transaction.verify({
                    transReference: this.$session.get('reference-key')
                })
                .then(verify => {
                    if(verify){
                        this.$router.replace({name: 'deposits', query: {status: 'txSaved'}})
                        izitoast.success({
                            title: 'Success',
                            message:'Transaction complete'
                        })
                    }
                    
                })

            }
            catch(err){
                if(err.response.status === 400){
                    izitoast.error({
                        title: 'Error',
                        message: err.response.data.errors[0].title
                    })
                }
                else{
                    izitoast.error({
                        title: 'Error',
                        message: 'An unknown error occurred'
                    })
                }
            }
        }
    },

    async created() {
        axios.post('/paystackSave', this.form)
    }
}
</script>