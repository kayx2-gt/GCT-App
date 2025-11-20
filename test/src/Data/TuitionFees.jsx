const tuitionFees = {
    "BS in Civil Engineering": {
        firstSemester: {
        1: { general: 3388.63, tuition: 8167.50, total: 11556.13 },
        2: { general: 3412.83, tuition: 5899.32, total: 9312.15 },
        3: { general: 4309.25, tuition: 6267.84, total: 10577.09 },
        4: { general: 3377.04, tuition: 5484.36, total: 8861.40 },
        },
        secondSemester: {
        1: { general: 4284.54, tuition: 7562.50, total: 11847.04 },
        2: { general: 3448.62, tuition: 5976.72, total: 9425.34 },
        3: { general: 4309.25, tuition: 5223.20, total: 9532.45 },
        4: { general: 3377.04, tuition: 5745.52, total: 9122.56 },
        },
    },

    "BS in Mechanical Engineering": {
        firstSemester: {
        1: { general: 4320.84, tuition: 8167.50, total: 12488.34 },
        2: { general: 3377.04, tuition: 5094.18, total: 8471.22 },
        3: { general: 4345.04, tuition: 5364.61, total: 9709.65 },
        4: { general: 5241.46, tuition: 7051.32, total: 12292.78 },
        },
        secondSemester: {
        1: { general: 4320.33, tuition: 7662.57, total: 11982.90 },
        2: { general: 4345.04, tuition: 5254.17, total: 9599.21 },
        3: { general: 3377.04, tuition: 5484.36, total: 8861.40 },
        4: { general: 7105.88, tuition: 6790.16, total: 13896.04 },
        },
    },

    "BS in Electrical Engineering": {
        firstSemester: {
        1: { general: 4356.63, tuition: 7965.07, total: 12321.70 },
        2: { general: 2444.83, tuition: 5821.92, total: 8266.75 },
        3: { general: 2480.62, tuition: 6430.91, total: 8911.53 },
        4: { general: 5241.46, tuition: 6006.68, total: 11248.14 },
        },
        secondSemester: {
        1: { general: 4320.33, tuition: 6755.07, total: 11075.40 },
        2: { general: 3377.04, tuition: 5336.76, total: 8713.80 },
        3: { general: 4309.25, tuition: 6006.68, total: 10315.93 },
        4: { general: 6173.67, tuition: 5745.52, total: 11919.19 },
        },
    },

    "BS in Accountancy": {
        firstSemester: {
        1: { general: 2456.42, tuition: 8167.50, total: 10623.92 },
        2: { general: 2480.62, tuition: 7029.63, total: 9510.25 },
        3: { general: 1512.62, tuition: 7051.32, total: 8563.94 },
        4: { general: 1512.62, tuition: 2350.44, total: 3863.06 },
        },
        secondSemester: {
        1: { general: 2420.12, tuition: 7865.00, total: 10285.12 },
        2: { general: 2480.62, tuition: 7029.63, total: 9510.25 },
        3: { general: 2480.62, tuition: 6692.07, total: 9172.69 },
        4: { general: 1512.62, tuition: 5484.36, total: 6996.98 },
        },
    },

    "BS in Business Administration": {
        firstSemester: {
        1: { general: 2456.42, tuition: 4537.50, total: 6993.92 },
        2: { general: 1512.62, tuition: 5579.34, total: 7091.96 },
        3: { general: 1512.62, tuition: 5484.36, total: 6996.98 },
        4: { general: 1512.62, tuition: 3917.40, total: 5430.02 },
        },
        secondSemester: {
        1: { general: 2420.12, tuition: 6957.50, total: 9377.62 },
        2: { general: 1512.62, tuition: 4851.60, total: 6364.22 },
        3: { general: 1512.62, tuition: 5484.36, total: 6996.98 },
        4: { general: 3377.04, tuition: 1566.96, total: 4944.00 },
        },
    },

    "BS in Hotel Management": {
        firstSemester: {
        1: { general: 2456.42, tuition: 7260.00, total: 9716.42 },
        2: { general: 6231.62, tuition: 8766.68, total: 14998.30 },
        3: { general: 6231.62, tuition: 9337.44, total: 15569.06 },
        4: { general: 4658.62, tuition: 5835.90, total: 10494.52 },
        },
        secondSemester: {
        1: { general: 5566.12, tuition: 6957.50, total: 12523.62 },
        2: { general: 4658.62, tuition: 8766.68, total: 13425.30 },
        3: { general: 4658.62, tuition: 8170.26, total: 12828.88 },
        4: { general: 4658.62, tuition: 2334.36, total: 6992.98 },
        },
    },

    "BS in Information Technology": {
        firstSemester: {
        1: { general: 4392.42, tuition: 6952.92, total: 11345.34 },
        2: { general: 3448.62, tuition: 9747.53, total: 13196.15 },
        3: { general: 5384.62, tuition: 8413.44, total: 13798.06 },
        4: { general: 3448.62, tuition: 3582.60, total: 7031.22 },
        },
        secondSemester: {
        1: { general: 4356.12, tuition: 6650.42, total: 11006.54 },
        2: { general: 4416.62, tuition: 9747.53, total: 14164.15 },
        3: { general: 4416.62, tuition: 8413.44, total: 12830.06 },
        4: { general: 2480.62, tuition: 3542.07, total: 6022.69 },
        },
    },

    "BS in Computer Science": {
        firstSemester: {
        1: { general: 4392.42, tuition: 6952.92, total: 11345.34 },
        2: { general: 3448.62, tuition: 9747.53, total: 13196.15 },
        3: { general: 5384.62, tuition: 8413.44, total: 13798.06 },
        4: { general: 3448.62, tuition: 3582.60, total: 7031.22 },
        },
        secondSemester: {
        1: { general: 4356.12, tuition: 7858.13, total: 12214.25 },
        2: { general: 3448.62, tuition: 9747.53, total: 13196.15 },
        3: { general: 4416.62, tuition: 8413.44, total: 12830.06 },
        4: { general: 2480.62, tuition: 2374.89, total: 4855.51 },
        },
    },

    "BS in Office Administration": {
        firstSemester: {
        1: { general: 2456.42, tuition: 6352.50, total: 8808.92 },
        2: { general: 2480.62, tuition: 5331.57, total: 7812.19 },
        3: { general: 2480.62, tuition: 5908.59, total: 8389.21 },
        4: { general: 4345.04, tuition: 4341.63, total: 8686.67 },
        },
        secondSemester: {
        1: { general: 2420.12, tuition: 6050.00, total: 8470.12 },
        2: { general: 1512.62, tuition: 4851.60, total: 6364.22 },
        3: { general: 3412.83, tuition: 5908.59, total: 9321.42 },
        4: { general: 3377.04, tuition: 1566.96, total: 4944.00 },
        },
    },
    };
    export default tuitionFees;