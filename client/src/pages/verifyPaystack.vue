<template>
    <Modal>
      <div slot="title">Verify payment</div>
      <div slot="content">
        <span class="w-full text-red-500 bg-red-300 p-3 rounded">Click on the button below to verify your payment.</span>
      </div>
      <div slot="footer">
        <button @click="verify" :disabled="verifyBtn.make" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white">
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
const paystackService = paystack('sk_test_95a9b3d3f60fdd98ece68c4ca8a76e0f496c0cef')

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
                email: this.$session.get('email'),
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
            this.verifyBtn = true
            
            try{
                paystackService.transaction.verify({
                    transReference: this.$session.get('reference-key')
                })
                .then(async verify => {
                    if(verify){
                        axios.post('/paystackSave', this.form)
                        this.console.log(verify)
                        this.$router.replace({name: 'deposits', query: {status: 'txSaved'}})
                        izitoast.success({
                            title: 'Success',
                            message:'Transaction complete.'
                        })
                    }
                    
                })
                
                // .then(res => {
                //     this.console.log(this.form)
                //     this.console.log(res)
                // })
                

                //TODO: link this module to the payment init and test
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
    }
}
</script>