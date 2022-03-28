
export function SET_TOTAL_CNY(state, totalCNY) {
    state.totalCNY = totalCNY
}

export function ADD_SALES(state, sales) {
    state.sales.push(sales)
}

export function DELETE_SALES(state, id) {
    const index = state.sales.findIndex(o => o.id === id)
    if (index >= 0) {
        state.sales.splice(index, 1)
    }
}

export function SET_CURRENT_SALES(state, id) {
    state.currentSales = id
}

export function ADD_PATTERN(state, pattern) {
    const sales = state.sales.find(o => o.id === state.currentSales)
    if (!sales) {
        return
    }
    sales.patterns.unshift(pattern)
}

export function DELETE_PATTERN(state, name) {
    const sales = state.sales.find(o => o.id === state.currentSales)
    if (!sales) {
        return
    }
    const index = sales.patterns.findIndex(o => o.name === name)
    if (index >= 0) {
        sales.patterns.splice(index, 1)
    }
}
