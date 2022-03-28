<template>
  <q-page class="flex" :style-fn="stylePage">
    <q-scroll-area class="fit" v-show="this.columns.length>0">
      <div class="q-pa-md fit">
        <q-table :rows="tableData" :columns="columns" :fullscreen="false" :pagination="{rowsPerPage:20}">
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="column in columns" :key="column.name" :props="props">
                <span v-html="parseTD(props.row[column.name])"></span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-scroll-area>
    <div class="flex center fit" v-show="this.columns.length===0">
      <q-img @click.stop="chooseExcel" src="../assets/pinkpig.svg" spinner-color="white" style="max-width:400px;margin:auto;cursor:pointer" />
    </div>
  </q-page>
</template>

<script>
import { read } from 'xlsx'
import { transformSheets } from '../helper/xlsx.js'
import { mapMutations } from 'vuex'

export default ({
  name: 'PageIndex',
  created() {
    this.$bus.on('recalc', this.initTable)
    this.$bus.on('importExcel', this.importExcel)
  },
  beforeUnmount() {
    this.$bus.off('recalc', this.initTable)
    this.$bus.off('importExcel', this.importExcel)
  },
  data() {
    return {
      columns: [],
      tableData: [],
      excelData: null
    }
  },
  computed: {
    totalCNY: {
      get() {
        return this.$store.state.pattern.totalCNY
      },
      set(val) {
        this.SET_TOTAL_CNY(val)
      }
    }
  },
  methods: {
    ...mapMutations('pattern', ['SET_TOTAL_CNY']),
    stylePage(offset, height) {
      return { height: `${height - offset}px` }
    },
    chooseExcel() {
      window.myAPI.importExcel().then(data => {
        this.importExcel(data)
      })
    },
    importExcel(data) {
      this.excelData = data
      this.initTable()
    },
    initTable() {
      this.columns = []
      this.tableData = []
      const sheetData = this.transformData(this.excelData)
      Object.keys(sheetData[0]).forEach(key => {
        const item = {
          name: key,
          label: key,
          align: 'left',
          field: key
        }
        this.columns.push(item)
      })
      this.columns.push({
        name: 'result',
        label: '计算结果',
        align: 'left',
        field: 'result'
      })
      this.tableData = sheetData
      this.calcTotal()
    },
    transformData(data) {
      const wb = read(data, { type: 'array' })
      const sheets = wb.Sheets
      const sheetData = transformSheets(sheets)
      return sheetData
    },
    parseTD(tdString) {
      if (!tdString) {
        return ''
      }
      tdString = `${tdString}`
      const number = +tdString
      if (number < 10000) {
        return `<span style="background-color:#ffaba5;padding:5px;margin:5px;border-radius:5px">
              ${tdString}
            </span>`
      } else if (tdString.includes('*疑似错误需要手动计算加入总价*')) {
        return `<span style="background-color: #f44336;color: white;padding: 5px;border-radius: 5px;">
              ${tdString}
            </span>`
      }

      const patterns = this.$store.getters['pattern/currentSales']?.patterns || []
      patterns.forEach(pattern => {
        const result = tdString.toUpperCase().replaceAll(pattern.name.toUpperCase(), `<span style="background-color:#ffaba5;padding:5px;margin:5px;border-radius:5px">${pattern.name}</span>`)
        tdString = result
      })

      return tdString
    },
    calcTotal() {
      this.totalCNY = 0
      const patterns = this.$store.getters['pattern/currentSales']?.patterns || []
      this.tableData.forEach(rowData => {
        const names = []
        let number = 0, namesNumber = 0, rowPrice = 0
        Object.keys(rowData).forEach(key => {
          const item = `${rowData[key]}`
          const assumeNumber = +item
          if (assumeNumber < 10000) {
            number = assumeNumber
          }
          patterns.forEach(pattern => {
            const hitArray = [...item.toUpperCase().matchAll(new RegExp(pattern.name.toUpperCase(), 'g'))]
            if (hitArray.length > 0) {
              names.push({ price: pattern.price, count: hitArray.length, formula: `${pattern.price}*${hitArray.length}` })
              namesNumber += hitArray.length
            }
          })
        })
        if ((number === namesNumber || number === 0) && namesNumber !== 0) { // 相等或者没有找到数量
          names.forEach(o => {
            rowPrice += o.price * o.count
          })
          rowData.result = `${names.map(o => o.formula).join('+')} = ${rowPrice}`
        } else {
          if (namesNumber === 1) { // 同一类型多件,基本没问题
            names.forEach(o => {
              rowPrice += o.price * number// 乘上表格中的数量
              rowData.result = `${names.map(o => o.formula).join('+')}*${number} = ${rowPrice}`
            })
          } else {
            rowData.result = `*疑似错误需要手动计算加入总价*
            ${names.join('+')} = ${rowPrice}`
          }
        }
        this.totalCNY += rowPrice
      })
    }
  }
})
</script>
<style lang="sass" scoped>
</style>
