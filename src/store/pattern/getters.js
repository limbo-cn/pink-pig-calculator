export function currentSales(state) {
    return state.sales.find(o => o.id === state.currentSales)
}
