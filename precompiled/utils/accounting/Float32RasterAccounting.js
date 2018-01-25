
// The Accounting namespaces provide operations commonly used in accounting software
// i.e. where ever there are conserved quantities that need to be transferred and allocated
// All input are raster objects, e.g. VectorRaster or Float32Raster
Float32RasterAccounting = {};
Float32RasterAccounting.priority_allocation = function(amount, priority1_size, priority1_allocation, priority2_allocation) {
    ASSERT_IS_ARRAY(amount, Float32Array)
    ASSERT_IS_ARRAY(priority1_size, Float32Array)
    ASSERT_IS_ARRAY(priority2_size, Float32Array)
    ASSERT_IS_ARRAY(priority1_allocation, Float32Array)
    ASSERT_IS_ARRAY(priority2_allocation, Float32Array)

    var amount_i = 0.0;
    var overflow_i = 0.0;
    var priority1_size_i = 0.0;
    for (var i = 0, li = amount.length; i < li; i++) {
    	amount_i = amount[i];
    	priority1_size_i = priority1_size[i];
    	priority1_allocation[i] = amount_i > priority1_size_i? priority1_size_i : amount_i;
		overflow_i = priority1_size_i - amount_i;
		priority2_allocation[i] = overflow_i < 0? 0 : overflow_i;
    }
}
Float32RasterAccounting.transaction = function (amount, from, to) {
    ASSERT_IS_ARRAY(from, Float32Array)
    ASSERT_IS_ARRAY(amount, Float32Array)
    ASSERT_IS_ARRAY(to, Float32Array)
    var amount_i = 0.0;
    for (var i = 0, li = amount.length; i < li; i++) {
        amount_i = amount[i];
        from[i] -= amount_i;
        to[i] += amount_i;
    }
}
Float32RasterAccounting.transaction_at_selection = function (amount, from, to, selection) {
    ASSERT_IS_ARRAY(from, Float32Array)
    ASSERT_IS_ARRAY(amount, Float32Array)
    ASSERT_IS_ARRAY(to, Float32Array)
    var amount_i = 0.0;
    for (var i = 0, li = amount.length; i < li; i++) {
        if (selection[i] === 1) {
            amount_i = amount[i];
            from[i] -= amount_i;
            to[i] += amount_i;
        }
    }
}