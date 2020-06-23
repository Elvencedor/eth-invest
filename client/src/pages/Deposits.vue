<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center flex-wrap sm:flex-no-wrap">
      <div class="mr-4 sm:mr-0">
        <h1 class="text-xl text-gray-900 mb-2">Deposits</h1>
        <p class="text-gray-600 leading-tight">Local and blockchain transfers to your balance.</p>
      </div>
      <button
        @click="openDepositModal"
        class="py-2 px-4 bg-green-500 text-white focus:bg-green-600 rounded shadow text-sm mt-4 sm:mt-0"
      >
        <span class="fa fa-donate mr-1"></span> Add Funds
      </button>
      <button
        @click="openPaystackModal"
        class="py-2 px-4 bg-green-500 text-white focus:bg-green-600 rounded shadow text-sm mt-4 sm:mt-0"
      >
        <span class="fa fa-donate mr-1"></span> Use paystack
      </button>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator
          :count="meta.count"
          :visiblePage="5"
          :pageLength="deposits.length"
          @pageChanged="refetchDeposit"
        />
      </div>
      <div
        class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right"
      >
        <input
          @input="filterDeposit($event)"
          type="text"
          class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm"
          placeholder="Filter by ID"
        />
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent
        :columns="table.columns"
        :items="deposits"
        :options="table.options"
        :loading="table.loading"
      >
        <div slot="sn" slot-scope="props">
          {{
          BigNumber(meta.pagination.current)
          .minus(1)
          .times(meta.pagination.limit)
          .plus(props.index + 1)
          .toString()
          }}
        </div>
        <div slot="id" slot-scope="props">
          {{ truncate(props.item.id, 13) }}
          <button
            @click="copyToClipboard(props.item.id)"
            class="p-1 focus:outline-none"
          >
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="amount" slot-scope="props">N{{ BigNumber(props.item.amount).toFormat(2) }}</div>
        <div slot="status" slot-scope="props">
          <span
            v-if="props.item.status === 'cancelled'"
            class="text-red-600 text-center inline-block px-3 py-1 rounded-full"
          >
            <i class="fas fa-times text-xl"></i>
          </span>
          <span
            v-if="props.item.status === 'pending'"
            class="text-yellow-600 text-center inline-block px-3 py-1 rounded-full"
          >
            <i class="fas fa-clock text-xl"></i>
          </span>
          <span
            v-if="props.item.status === 'completed'"
            class="text-green-600 text-center inline-block px-3 py-1 rounded-full"
          >
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="txid" slot-scope="props">
          <div v-if="props.item.status !== 'cancelled'">
            <div v-if="props.item.benefactor">
              Transfer from
              <span
                class="text-green-500"
              >{{ truncate(props.item.benefactor.username, 16) }}</span>
              <button
                @click="copyToClipboard(props.item.benefactor.username)"
                class="p-1 focus:outline-none"
              >
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div v-else-if="props.item.txid">
              <span>{{ truncate(props.item.txid, 18) }}</span>
              <button @click="copyToClipboard(props.item.txid)" class="p-1 focus:outline-none">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <button
              v-else
              @click="comfirmDesposit(props.item)"
              class="bg-blue-500 px-2 py-1 text-white rounded disabled:opacity-50"
            >Submit TXID</button>
          </div>
          <div v-else>-</div>
        </div>
        <div slot="createdAt" slot-scope="props">{{ formatDate(props.item.createdAt) }}</div>
        <div slot="updatedAt" slot-scope="props">{{ formatDate(props.item.updatedAt) }}</div>
      </TableComponent>
    </div>
    <Modal v-if="makePaystackModal" v-on:close="makePaystackModal = false">
      <div slot="title">Deposit Funds (paystack)</div>
      <div slot="content">
        <div v-if="step === 0">
          <label
            for="amount"
            class="block uppercase text-sm text-gray-900 tracking-wide"
          >Amount(NGN)</label>
          <input
            type="text"
            id="amount"
            v-model="form.amount"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            placeholder="0.00"
          />
          <div slot="footer">
            <button
              @click="pay"
              :disabled="depositBtn.make"
              class="w-full p-3 bg-green-500 text-white hover:bg-green-600 rounded"
            >
              <span v-if="depositBtn.make" class="fas fa-spinner fa-spin"></span>
              <span v-else>Deposit</span>
            </button>
          </div>
        </div>
        <div v-if="step === 1">
          <span class="fas fa-spinner fa-spin"></span>
          <span>Redirecting to the payment portal...</span>
        </div>
      </div>
    </Modal>
    <Modal v-if="makeDepositModal" v-on:close="makeDepositModal = false">
      <div slot="title">Deposit Funds</div>
      <div slot="content">
        <div v-if="step === 0">
          <div>
            <label
              for="amount"
              class="block uppercase text-sm text-gray-900 tracking-wide"
            >Amount(NGN)</label>
            <input
              type="test"
              id="amount"
              v-model="payForm.amount"
              class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
              placeholder="0.00"
            />
          </div>
        </div>
        <div v-if="step === 1">
          <p class="bg-red-100 text-sm text-red-800 px-4 py-2 rounded">
            Make payment of
            <b>{{ BigNumber(selectedDeposit.assetAmount).toFormat(4) }} ETH</b> to the
            account below!
          </p>
          <div class="flex justify-center items-center">
            <img :src="selectedDeposit.url" alt="address barcode" />
          </div>
          <div class="text-center">
            <span class="bg-gray-200 text-sm p-1 rounded text-gray-700">
              {{
              selectedDeposit.address
              }}
            </span>
          </div>
          <div class="mt-10">
            <label
              for="txid"
              class="block uppercase text-sm text-gray-900 tracking-wide"
            >Transaction ID</label>
            <input
              type="test"
              id="txid"
              v-model="txid"
              class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
              autocomplete="off"
              placeholder="<Enter TXID here>"
            />
          </div>
        </div>
      </div>
      <div slot="footer">
        <button
          v-if="step === 0"
          @click="submit"
          :disabled="depositBtn.make"
          class="w-full p-3 bg-green-500 text-white hover:bg-green-600 rounded"
        >
          <span v-if="depositBtn.make" class="fas fa-spinner fa-spin"></span>
          <span v-else>Deposit</span>
        </button>
        <div v-if="step === 1">
          <button
            @click="update"
            class="w-full p-3 bg-green-500 text-white hover:bg-green-600 rounded"
            :disabled="depositBtn.update"
          >
            <span v-if="depositBtn.update" class="fas fa-spinner fa-spin"></span>
            <span v-else>Update</span>
          </button>
        </div>
      </div>
    </Modal>
    <Modal v-if="updateDepositModal" v-on:close="updateDepositModal = false">
      <div slot="title">Confirm Deposit</div>
      <div slot="content">
        <p class="bg-red-100 text-sm text-red-800 px-4 py-2 rounded">
          To finalize your deposit, please make an exact (do not
          round/approximate amount) payment of
          <b>{{ BigNumber(selectedDeposit.assetAmount).toFormat(4) }} ETH</b> to the account below,
          provide the transaction ID/hash, then confirm.
        </p>
        <div class="flex justify-center items-center mt-2">
          <img :src="selectedDeposit.url" alt="address barcode" />
        </div>
        <div class="text-center">
          <span class="bg-gray-200 text-sm p-1 rounded text-gray-700">
            {{
            selectedDeposit.address
            }}
          </span>
        </div>
        <div class="mt-10">
          <label
            for="txid"
            class="block uppercase text-sm text-gray-900 tracking-wide"
          >Transaction ID</label>
          <input
            type="test"
            id="txid"
            v-model="txid"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            autocomplete="off"
            placeholder="<Enter TXID here>"
          />
        </div>
      </div>
      <div slot="footer">
        <button
          @click="update"
          class="w-full p-3 bg-green-500 text-white hover:bg-green-600 rounded"
          :disabled="depositBtn.update"
        >
          <span v-if="depositBtn.update" class="fas fa-spinner fa-spin"></span>
          <span v-else>Update</span>
        </button>
      </div>
    </Modal>
  </section>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import izitoast from "izitoast";
import { mapActions } from "vuex";
import TableComponent from "@/components/main/utils/TableComponent";
import Modal from "@/components/main/utils/Modal";
import Paginator from "@/components/main/utils/Paginator";
import mixins from "../mixins";
import BigNumber from "bignumber.js";
import VueSession from "vue-session";
import * as paystack from "paystack";
const paystackService = new paystack(
  "sk_test_e62d31faaf67d3af0108224046b2c3de72ccbb9c"
);

Vue.use(VueSession);

export default {
  name: "deposits",
  mixins: [mixins],
  components: {
    Modal,
    Paginator,
    TableComponent
  },

  data() {
    return {
      BigNumber,
      table: {
        loading: false,
        columns: {
          sn: "S/N",
          id: "Deposit ID",
          amount: "Amount",
          status: "Status",
          txid: "TXID/Meta",
          createdAt: "Created",
          updatedAt: "Updated"
        },
        options: {
          columnsClasses: {
            amount: "text-right",
            status: "text-center"
          }
        }
      },
      makeDepositModal: false,
      makePaystackModal: false,
      updateDepositModal: false,
      depositBtn: {
        make: false,
        update: false
      },
      step: 0,
      data: "",
      deposits: [],
      meta: {},
      selectedDeposit: "",
      txid: "",
      payForm: {
        amount: ""
      },
      form: {
        amount: "",
        email: "",
        reference: ""
      },
      ref: "tx-" + Math.floor(Math.random() * 1000000000 + 1)
    };
  },

  computed: {
    userHasPendingDeposit() {
      return this.deposits.find(deposit => deposit.status === "pending");
    },
    console: () => console
  },

  methods: {
    ...mapActions({
      fetchSelf: "auth/self"
    }),

    async refetchDeposit(options = null) {
      this.table.loading = true;

      if (options) {
        options = Object.keys(options)
          .reduce(function(a, k) {
            a.push(k + "=" + encodeURIComponent(options[k]));
            return a;
          }, [])
          .join("&");
      }

      try {
        const res = await axios.get(`/deposits${options ? "?" + options : ""}`);

        this.deposits = res.data.data;
        this.meta = res.data.meta;
      } catch (err) {
        if (err.response.status === 400) {
          izitoast.error({
            title: "Error",
            message: err.response.data.errors[0].title
          });
        }
      } finally {
        this.table.loading = false;
      }
    },

    comfirmDesposit(deposit) {
      this.txid = "";
      this.selectedDeposit = deposit;
      this.updateDepositModal = true;
    },

    openDepositModal() {
      if (this.userHasPendingDeposit) {
        izitoast.error({
          title: "Error",
          message: "You have a pending deposit. Confirm it first."
        });

        return false;
      }

      this.step = 0;
      this.makeDepositModal = true;
    },

    openPaystackModal() {
      this.step = 0;
      this.makePaystackModal = true;
    },

    async submit() {
      this.depositBtn.make = true;

      try {
        const res = await axios.post(`/deposits`, this.payForm);

        this.selectedDeposit = res.data.data;
        this.deposits = [...this.deposits, res.data.data];
        this.step = 1;

        izitoast.info({
          title: "Pending",
          message: "Deposit request is pending"
        });
      } catch (err) {
        this.makeDepositModal = false;

        if (err.response.status === 400) {
          izitoast.error({
            title: "Error",
            message: err.response.data.errors[0].title
          });
        } else {
          izitoast.error({
            title: "Error",
            message: "An unknown error occured."
          });
        }
      } finally {
        this.payForm.amount = "";
        this.depositBtn.make = false;
      }
    },

    async pay() {
      this.depositBtn.make = true;
      const amt = this.form.amount * 100;

      try {
        this.fetchSelf().then(self => {
          this.$session.set("email", self.data.data.email);
          this.$session.set("amount", amt / 100);

          paystackService.transaction
            .initialize({
              amount: amt,
              reference: this.form.reference,
              email: self.data.data.email
            })
            .then(res => {
              if (res) {
                const paystackData = res.data.authorization_url;
                this.$session.set("reference-key", res.data.reference);
                location.replace(`${paystackData}`);
              }
            });
        });
      } catch (err) {
        this.makePaystackModal = false;
        if (err.response.status === 400) {
          izitoast.error({
            title: "Error",
            message: err.response.data.errors[0].title
          });
        } else {
          izitoast.error({
            title: "Error",
            message: "An unknown error occured."
          });
        }
      } finally {
        this.form.amount = "";
        this.form.email = "";
        this.depositBtn.make = false;
        this.step = 1;
      }
    },

    async update() {
      this.depositBtn.update = true;

      await axios
        .put(`/updateDeposit/${this.selectedDeposit.id}`, { txid: this.txid })
        .then(res => {
          this.fetchSelf();
          Vue.set(
            this.deposits,
            this.deposits.findIndex(d => d.id === this.selectedDeposit.id),
            res.data.data
          );

          this.makeDepositModal = false;
          this.updateDepositModal = false;
          izitoast.success({
            title: "Success",
            message: "Your transaction is now completed!"
          });
        })
        .catch(err => {
          err.response.data.errors.forEach(error => {
            izitoast.error({
              title: "Error",
              message: error.title
            });
          });
        })
        .finally(() => {
          this.depositBtn.update = false;
        });
    },

    filterDeposit(e) {
      this.refetchDeposit({ search: e.target.value });
    }
  },

  async created() {
    this.refetchDeposit();
  }
};
</script>
