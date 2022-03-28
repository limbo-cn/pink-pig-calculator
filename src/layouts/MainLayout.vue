<template>
  <q-layout view="lHh lpr lFf">
    <q-header elevated>
      <q-toolbar class="shadow-1 bg-pink-5">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>
          小粉猪计算器
        </q-toolbar-title>

        <q-btn :label="currentSales?.name || '选择代发商'" style="margin-right:10px" @click="showSales = true" />
        <q-btn label="导入" style="margin-right:10px" @click="importExcel" />
        <q-btn label="重算" style="margin-right:10px" @click="reCalc" />
        <div class="text-subtitle2">总价：{{ totalCNY }} ¥ </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" overlay elevated bordered class="bg-grey-1">
      <q-scroll-area class="fit">
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
            </q-item-section>

            <q-item-section>
              <q-item-label header>
                款号/名称 & 单价
              </q-item-label>
            </q-item-section>

            <q-item-section avatar>
              <q-btn @click="showAdd = true" icon="add" color="pink-4" flat round />
            </q-item-section>
          </q-item>

          <q-item v-for="pattern in patterns" :key="pattern.name">
            <q-item-section>
              <q-item-label>{{ pattern.name }}</q-item-label>
              <q-item-label caption>
                {{ pattern.price }} ¥
              </q-item-label>
            </q-item-section>

            <q-item-section avatar>
              <q-btn @click="toDeletePattern(pattern.name)" icon="delete" flat round />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="showAdd">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">添加款号/名称</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="name" @keypress.enter="addPattern" color="pink-4" dense style="width:100%">
            <template v-slot:prepend>
              <div class="text-subtitle2">
                名称
              </div>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model.number="price" @keypress.enter="addPattern" type="number" color="pink-4" dense style="width:100%">
            <template v-slot:prepend>
              <div class="text-subtitle2">
                单价
              </div>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="pink-4" v-close-popup />
          <q-btn flat label="确定" color="pink-4" @click="addPattern" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSales" @show="isAddNewSales=false">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">选择代发商</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-show="isAddNewSales" v-model="salesName" color="pink-4" dense style="width:100%">
            <template v-slot:prepend>
              <div class="text-subtitle2">
                名称
              </div>
            </template>
          </q-input>
          <q-select dense v-show="!isAddNewSales" v-model="salesVal" :options="sales" emit-value map-options option-value="id" option-label="name" color="pink-4" style="width:100%" behavior="menu">
            <template v-slot:prepend>
              <div class="text-subtitle2">
                选择代发商
              </div>
            </template>
          </q-select>
          <q-checkbox v-model="isAddNewSales" color="pink-4" left-label label="我要添加新的代发商" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat v-show="!isAddNewSales" @dblclick="deleteSales" label="双击删除" color="pink-4" />
          <q-btn outline label="取消" color="pink-4" v-close-popup />
          <q-btn outline v-show="!isAddNewSales" @click="chooseSales" label="确定" color="pink-4" />
          <q-btn outline v-show="isAddNewSales" @click="addSales" label="确定" color="pink-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAlert">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">不要瞎搞！</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ alertMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="pink-4" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDelete">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">确认</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          确定删除？
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="pink-4" @click="deletePattern" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { uid } from 'quasar'
import { mapMutations } from 'vuex'

export default ({
  name: 'MainLayout',
  data() {
    return {
      leftDrawerOpen: false,
      showSales: false,
      isAddNewSales: false,
      salesVal: '',
      salesName: '',
      showAdd: false,
      showAlert: false,
      alertMessage: '',
      showDelete: false,
      nameToDelete: '',
      name: '',
      price: ''
    }
  },
  computed: {
    patterns() {
      return this.currentSales?.patterns || []
    },
    totalCNY() {
      return this.$store.state.pattern.totalCNY
    },
    sales() {
      return this.$store.state.pattern.sales
    },
    currentSales() {
      return this.$store.getters['pattern/currentSales']
    }
  },
  methods: {
    ...mapMutations('pattern', ['ADD_PATTERN', 'DELETE_PATTERN', 'ADD_SALES', 'DELETE_SALES', 'SET_CURRENT_SALES']),
    alert(val) {
      this.showAlert = true
      this.alertMessage = val
    },
    deleteSales() {
      this.DELETE_SALES(this.salesVal)
      this.salesVal = ''
      this.SET_CURRENT_SALES(this.salesVal)
    },
    chooseSales() {
      this.SET_CURRENT_SALES(this.salesVal)
      this.showSales = false
    },
    addSales() {
      const sales = {
        id: uid(),
        name: this.salesName,
        patterns: []
      }
      this.ADD_SALES(sales)
      this.salesVal = sales.id
      this.SET_CURRENT_SALES(this.salesVal)
      this.showSales = false
    },
    addPattern() {
      if (this.price > 100 || this.price < 0) {
        this.alert('价格过高或过低')
        return
      }
      const item = { name: this.name, price: +this.price }
      const isExist = !!this.patterns.find(o => o.name.toUpperCase() === item.name.toUpperCase())
      if (!isExist) {
        this.ADD_PATTERN(item)
      } else {
        this.alert('款号/名称已存在!')
        return
      }
      this.showAdd = false
    },
    toDeletePattern(name) {
      this.nameToDelete = name
      this.showDelete = true
    },
    deletePattern() {
      this.DELETE_PATTERN(this.nameToDelete)
    },
    importExcel() {
      window.myAPI.importExcel().then(data => {
        this.$bus.emit('importExcel', data)
      })
    },
    reCalc() {
      this.$bus.emit('recalc')
    }
  }
})
</script>
