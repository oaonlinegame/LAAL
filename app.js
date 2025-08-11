document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'crm_leads_vuetify_v2';
    const SETTINGS_KEY = 'crm_settings_vuetify_v2';

    const getLeads = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            console.error("Could not parse leads from local storage", e);
            return [];
        }
    };

    const saveLeads = (list) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    };

    const getSettings = () => {
        try {
            const defaultSettings = {
                types: ["จำนำทะเบียน", "เช่าซื้อ", "กู้เพิ่ม"],
                interests: ["สนใจ", "รอดู", "ไม่สนใจ"],
                calls: ["ติดต่อได้", "ติดต่อไม่ได้", "นัดหมายแล้ว"],
                campaigns: ["", "แคมเปญลดดอก", "โปรพิเศษ", "รีไฟแนนซ์"]
            };
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            if (settings) {
                return {
                    types: settings.types || defaultSettings.types,
                    interests: settings.interests || defaultSettings.interests,
                    calls: settings.calls || defaultSettings.calls,
                    campaigns: settings.campaigns || defaultSettings.campaigns
                };
            }
            return defaultSettings;
        } catch (e) {
            console.error("Could not parse settings from local storage", e);
            return {
                types: ["จำนำทะเบียน", "เช่าซื้อ", "กู้เพิ่ม"],
                interests: ["สนใจ", "รอดู", "ไม่สนใจ"],
                calls: ["ติดต่อได้", "ติดต่อไม่ได้", "นัดหมายแล้ว"],
                campaigns: ["", "แคมเปญลดดอก", "โปรพิเศษ", "รีไฟแนนซ์"]
            };
        }
    };

    const saveSettings = (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    };

    const seed = () => {
        if (getLeads().length === 0) {
            const sample = [
                {
                    id: crypto.randomUUID(), contract: "CN-101-0001", type: "จำนำทะเบียน", first: "สมชาย", last: "ใจดี", nick: "ชาย", phone: "0811111111", postal: "10110",
                    interest: "สนใจ", call: "ติดต่อได้", grade: "A", brand: "Toyota", model: "Vios", year: "2018", carPrice: "320000",
                    logs: [{
                        callDate: "2025-07-15", callTime: "10:30", appointment: "2025-07-20", accountStatus: "Active", lastActive: "2025-07-15",
                        termsTotal: 60, termsPaid: 20, carPrice: 320000, campaign: "แคมเปญลดดอก", grade: "A",
                        closeAmount: 150000, loanAmount: 120000, remainingAmount: 30000,
                        interestRate: 1.25, months: 48, monthlyPay: 3000,
                        expenses: 0, callStatus: "ติดต่อได้", interest: "สนใจ", detail: "ลูกค้าขอคิด 2-3 วัน", remarks: "นัดโทรซ้ำ"
                    }]
                },
                {
                    id: crypto.randomUUID(), contract: "CN-101-0002", type: "เช่าซื้อ", first: "ศิริพร", last: "มีสุข", nick: "พร", phone: "0822222222", postal: "10220",
                    interest: "รอดู", call: "นัดหมายแล้ว", grade: "B", brand: "Honda", model: "City", year: "2019", carPrice: "380000",
                    logs: [{
                        callDate: "2025-07-10", callTime: "14:15", appointment: "2025-07-12", accountStatus: "Active", lastActive: "2025-07-10",
                        termsTotal: 72, termsPaid: 30, carPrice: 380000, campaign: "โปรพิเศษ", grade: "B",
                        closeAmount: 180000, loanAmount: 150000, remainingAmount: 30000,
                        interestRate: 1.1, months: 60, monthlyPay: 3000,
                        expenses: 0, callStatus: "นัดหมายแล้ว", interest: "รอดู", detail: "ส่งเอกสารทางไลน์", remarks: ""
                    }]
                }
            ];
            saveLeads(sample);
        }
    };

    seed();

    new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        data: {
            loading: false,
            search: '',
            filters: {
                contract: '', type: '', first: '', last: '', nick: '', phone: '', grade: '', interest: '', call: '',
            },
            leads: [],
            settings: getSettings(),
            headers: [
                { text: 'เลขที่สัญญา', value: 'contract' },
                { text: 'ประเภท', value: 'type' },
                { text: 'ชื่อลูกค้า', value: 'fullName' },
                { text: 'เกรด', value: 'grade' },
                { text: 'ชื่อเล่น', value: 'nick' },
                { text: 'เบอร์โทร', value: 'phone' },
                { text: 'รหัสไปรษณีย์', value: 'postal' },
                { text: 'ความสนใจ', value: 'interest' },
                { text: 'สถานะการโทร', value: 'call' },
                { text: 'จัดการ', value: 'actions', sortable: false, align: 'center' },
            ],
            logModal: {
                show: false,
                currentLead: null,
                logs: [],
                latestLog: {},
                summary: {},
                headers: [
                    { text: 'วันที่โทร', value: 'callDate' }, { text: 'เวลา', value: 'callTime' }, { text: 'วันนัด', value: 'appointment' },
                    { text: 'งวดรวม/จ่ายแล้ว', value: 'termsSummary' }, { text: 'ราคารถ', value: 'carPrice' }, { text: 'แคมเปญ', value: 'campaign' },
                    { text: 'เกรด', value: 'grade' }, { text: 'ยอดปิด', value: 'closeAmount' }, { text: 'ยอดจัด', value: 'loanAmount' },
                    { text: 'ค่างวด/เดือน', value: 'monthlyPay' }, { text: 'สถานะการโทร', value: 'callStatus' }, { text: 'ความสนใจ', value: 'interest' },
                    { text: 'จัดการ', value: 'actions', sortable: false, align: 'center' },
                ]
            },
            modal: {
                show: false,
                title: '',
                isEdit: false,
                tab: 0,
                lead: { id: '', contract: '', type: '', first: '', last: '', nick: '', phone: '', postal: '', grade: '', brand: '', model: '', year: '', carPrice: '' }
            },
            addLogModal: {
                show: false,
                title: '',
                isEdit: false,
                editingIndex: null,
                tab: 0,
                lead: { id: '', contract: '', type: '', first: '', last: '', nick: '', phone: '', postal: '', grade: '', brand: '', model: '', year: '', carPrice: '' },
                log: {
                    closeAmount: '', loanAmount: '', expenses: 0, remainingAmount: '', interestRate: '', months: '', monthlyPay: '', campaign: '',
                    callDate: '', callTime: '', appointment: '', accountStatus: '', lastActive: '', termsTotal: '', termsPaid: '',
                    callStatus: '', interest: '', detail: '', remarks: ''
                }
            },
            settingsModal: {
                show: false,
                tab: 0,
                newVal: { types: '', interests: '', calls: '', campaigns: '' }
            },
            calculation: {
                carPrice: null,
                loanAmountPercent: null,
                closeAmount: null,
                interestRate: null,
                terms: null,
                expenses: null,
            }
        },
        computed: {
            filteredLeads() {
                return this.leads.filter(it => {
                    const fullName = `${it.first || ''} ${it.last || ''}`.toLowerCase();
                    return (
                        (!this.filters.contract || (it.contract || '').toLowerCase().includes(this.filters.contract.toLowerCase())) &&
                        (!this.filters.type || it.type === this.filters.type) &&
                        (!this.filters.first || (it.first || '').toLowerCase().includes(this.filters.first.toLowerCase())) &&
                        (!this.filters.last || (it.last || '').toLowerCase().includes(this.filters.last.toLowerCase())) &&
                        (!this.filters.nick || (it.nick || '').toLowerCase().includes(this.filters.nick.toLowerCase())) &&
                        (!this.filters.phone || (it.phone || '').toLowerCase().includes(this.filters.phone.toLowerCase())) &&
                        (!this.filters.interest || it.interest === this.filters.interest) &&
                        (!this.filters.call || it.call === this.filters.call) &&
                        (!this.filters.grade || (it.grade || '').toLowerCase().includes(this.filters.grade.toLowerCase()))
                    );
                });
            },
            computedRemainingAmount() {
                const closeAmount = parseFloat(this.addLogModal.log.closeAmount) || 0;
                const loanAmount = parseFloat(this.addLogModal.log.loanAmount) || 0;
                const expenses = parseFloat(this.addLogModal.log.expenses) || 0;
                const remaining = loanAmount - closeAmount - expenses;
                return remaining.toFixed(2);
            },
            computedMonthlyPay() {
                const loanAmount = parseFloat(this.addLogModal.log.loanAmount) || 0;
                const months = parseInt(this.addLogModal.log.months) || 0;
                const expenses = parseFloat(this.addLogModal.log.expenses) || 0;
                if (months > 0) {
                    const interestRate = parseFloat(this.addLogModal.log.interestRate) || 0;
                    const totalInterest = loanAmount * (interestRate / 100) * months;
                    const totalPay = loanAmount + expenses + totalInterest;
                    return (totalPay / months).toFixed(2);
                }
                return 0;
            },
            computedCalculation() {
                const carPrice = parseFloat(this.calculation.carPrice) || 0;
                const loanAmountPercent = parseFloat(this.calculation.loanAmountPercent) || 0;
                const closeAmount = parseFloat(this.calculation.closeAmount) || 0;
                const interestRate = parseFloat(this.calculation.interestRate) || 0;
                const terms = parseInt(this.calculation.terms) || 0;
                const expenses = parseFloat(this.calculation.expenses) || 0;

                const loanAmount = carPrice * (loanAmountPercent / 100);
                const remaining = loanAmount - closeAmount - expenses;

                let monthlyPayment = 0;
                let totalInterest = 0;
                if (loanAmount > 0 && terms > 0) {
                    totalInterest = loanAmount * (interestRate / 100) * terms;
                    monthlyPayment = (loanAmount + expenses + totalInterest) / terms;
                }

                return {
                    carPrice: carPrice > 0 ? this.fmtCurrency(carPrice) : '-',
                    loanAmountPercent: loanAmountPercent > 0 ? loanAmountPercent : '-',
                    closeAmount: closeAmount > 0 ? this.fmtCurrency(closeAmount) : '-',
                    interestRateText: interestRate > 0 ? `${interestRate} %/เดือน` : '-',
                    terms: terms > 0 ? terms : '-',
                    expenses: expenses > 0 ? this.fmtCurrency(expenses) : '-',
                    loanAmount: loanAmount > 0 ? this.fmtCurrency(loanAmount) : '-',
                    remainingAmount: remaining !== null ? this.fmtCurrency(remaining) : '-',
                    monthlyPayment: monthlyPayment > 0 ? monthlyPayment.toFixed(2) : '-',
                    totalInterest: totalInterest > 0 ? this.fmtCurrency(totalInterest) : '-',
                    totalPayable: (loanAmount + expenses + totalInterest) > 0 ? this.fmtCurrency(loanAmount + expenses + totalInterest) : '-',
                };
            }
        },
        watch: {
            'addLogModal.log.closeAmount': function (newVal) { this.addLogModal.log.remainingAmount = this.computedRemainingAmount; },
            'addLogModal.log.loanAmount': function (newVal) { this.addLogModal.log.remainingAmount = this.computedRemainingAmount; this.addLogModal.log.monthlyPay = this.computedMonthlyPay; },
            'addLogModal.log.months': function (newVal) { this.addLogModal.log.monthlyPay = this.computedMonthlyPay; },
            'addLogModal.log.interestRate': function (newVal) { this.addLogModal.log.monthlyPay = this.computedMonthlyPay; },
            'addLogModal.log.expenses': function (newVal) { this.addLogModal.log.remainingAmount = this.computedRemainingAmount; this.addLogModal.log.monthlyPay = this.computedMonthlyPay; }
        },
        created() {
            this.fetchLeads();
        },
        methods: {

            toNum(v) {
                // กันค่าว่าง/สตริงคั่นหลักพัน
                if (v === null || v === undefined || v === '') return 0;
                const n = Number(String(v).replace(/,/g, '').trim());
                return Number.isFinite(n) ? n : 0;
            },
            fmtCurrency(v) {
                const n = this.toNum(v);
                return n === 0 ? '0' : n.toLocaleString();
            },
            fmtNumber(v) {
                if (v === null || v === undefined || v === '') return '-';
                const n = Number(v);
                return Number.isFinite(n) ? n.toLocaleString() : '-';
            },

            fetchLeads() {
                this.loading = true;
                this.leads = getLeads().map(lead => ({
                    ...lead,
                    fullName: `${lead.first || ''} ${lead.last || ''}`,
                    carPrice: lead.carPrice ? Number(lead.carPrice) : null
                }));
                this.loading = false;
            },
            getChipColor(value) {
                switch (value) {
                    case 'จำนำทะเบียน': case 'สนใจ': case 'ติดต่อได้': return 'green';
                    case 'เช่าซื้อ': case 'รอดู': case 'นัดหมายแล้ว': return 'orange';
                    case 'กู้เพิ่ม': case 'ไม่สนใจ': case 'ติดต่อไม่ได้': return 'red';
                    default: return 'grey';
                }
            },
            render() {
                this.leads = getLeads().map(lead => ({ ...lead, fullName: `${lead.first || ''} ${lead.last || ''}` }));
            },
            clearFilters() {
                this.filters = { contract: '', type: '', first: '', last: '', nick: '', phone: '', grade: '', interest: '', call: '' };
            },
            openModal(mode, item = null) {
                this.modal.show = true;
                this.modal.isEdit = mode === 'edit';
                this.modal.title = mode === 'add' ? 'เพิ่มข้อมูล Lead' : 'แก้ไขข้อมูล Lead';
                this.modal.tab = 0;
                if (item) {
                    this.modal.lead = { ...item };
                } else {
                    this.modal.lead = {
                        id: '', contract: '', type: this.settings.types[0], first: '', last: '', nick: '', phone: '', postal: '',
                        grade: '', brand: '', model: '', year: '', carPrice: ''
                    };
                }
            },
            closeModal() {
                this.modal.show = false;
                this.modal.lead = {};
            },
            saveLead() {
                if (!this.modal.lead.contract) { alert('กรุณากรอกเลขที่สัญญา'); return; }
                const leads = getLeads();
                if (this.modal.isEdit) {
                    const index = leads.findIndex(l => l.id === this.modal.lead.id);
                    if (index !== -1) {
                        const existingContract = leads.find(l => l.contract === this.modal.lead.contract && l.id !== this.modal.lead.id);
                        if (existingContract) { alert('เลขที่สัญญาซ้ำ'); return; }
                        leads.splice(index, 1, this.modal.lead);
                    }
                } else {
                    const existingContract = leads.find(l => l.contract === this.modal.lead.contract);
                    if (existingContract) { alert('เลขที่สัญญาซ้ำ'); return; }
                    this.modal.lead.id = crypto.randomUUID();
                    this.modal.lead.logs = [];
                    this.modal.lead.interest = 'รอดู';
                    this.modal.lead.call = 'ติดต่อไม่ได้';
                    leads.push(this.modal.lead);
                }
                saveLeads(leads);
                this.fetchLeads();
                this.closeModal();
            },
            onEdit(item) { this.openModal('edit', item); },
            onDelete(id) {
                if (confirm('ยืนยันการลบรายการนี้?')) {
                    const updatedLeads = getLeads().filter(lead => lead.id !== id);
                    saveLeads(updatedLeads);
                    this.fetchLeads();
                }
            },
            onLog(item) {
                this.logModal.show = true;
                this.logModal.currentLead = JSON.parse(JSON.stringify(item));

                // Set default values for calculation inputs from the current lead
                this.calculation.carPrice = item.carPrice ? Number(item.carPrice) : null;
                this.calculation.loanAmountPercent = null;
                this.calculation.closeAmount = null;
                this.calculation.interestRate = null;
                this.calculation.terms = null;
                this.calculation.expenses = null;

                const logs = item.logs || [];
                const latestLog = logs.length > 0 ? logs[logs.length - 1] : {};

                // Use the latest log to pre-fill the calculation inputs, if they exist
                if (latestLog.closeAmount) {
                    this.calculation.closeAmount = parseFloat(latestLog.closeAmount);
                }
                if (latestLog.loanAmount && item.carPrice) {
                    this.calculation.loanAmountPercent = (parseFloat(latestLog.loanAmount) / parseFloat(item.carPrice)) * 100;
                }
                if (latestLog.interestRate) {
                    this.calculation.interestRate = parseFloat(latestLog.interestRate);
                }
                if (latestLog.months) {
                    this.calculation.terms = parseInt(latestLog.months);
                }
                if (latestLog.expenses) {
                    this.calculation.expenses = parseFloat(latestLog.expenses);
                }

                this.logModal.latestLog = Object.assign({
                    closeAmount: null,
                    loanAmount: null,
                    remainingAmount: null,
                    months: null,
                    monthlyPay: null,
                    interestRate: null,
                    expenses: null
                }, latestLog || {});

                this.logModal.logs = (item.logs || []).map(log => ({
                    ...log,
                    termsSummary: `${log.termsTotal || '-'} / ${log.termsPaid || '-'}`,
                    carPrice: log.carPrice ? Number(log.carPrice).toLocaleString() : '-',
                    closeAmount: log.closeAmount ? Number(log.closeAmount).toLocaleString() : '-',
                    loanAmount: log.loanAmount ? Number(log.loanAmount).toLocaleString() : '-',
                    monthlyPay: log.monthlyPay ? Number(log.monthlyPay).toLocaleString() : '-',
                }));
                this.logModal.summary = {
                    contract: item.contract || '-', type: item.type || '-', fullName: item.fullName || '-', nick: item.nick || '-', phone: item.phone || '-',
                    postal: item.postal || '-', brand: item.brand || '-', model: item.model || '-', year: item.year || '-', carPrice: item.carPrice ? Number(item.carPrice).toLocaleString() : '-', grade: item.grade || '-'
                };
            },
            closeLogModal() {
                this.logModal.show = false;
                this.logModal.currentLead = null;
                this.logModal.logs = [];
                this.logModal.latestLog = {};
            },
            openAddLog(leadId) {
                const lead = this.leads.find(l => l.id === leadId);
                const logs = lead?.logs || [];
                const latestLog = logs.length ? logs[logs.length - 1] : {};

                this.addLogModal.show = true;
                this.addLogModal.title = 'เพิ่มบันทึกการโทร';
                this.addLogModal.isEdit = false;
                this.addLogModal.editingIndex = null;
                this.addLogModal.tab = 0;
                this.addLogModal.lead = JSON.parse(JSON.stringify(lead));

                // นำค่าที่คำนวณจาก computedCalculation มาใช้เป็นค่าเริ่มต้น
                const loanAmount = this.toNum(this.calculation.carPrice) * (this.toNum(this.calculation.loanAmountPercent) / 100);
                const remaining = loanAmount - this.toNum(this.calculation.closeAmount) - this.toNum(this.calculation.expenses);

                this.addLogModal.log = {
                    closeAmount: this.toNum(this.calculation.closeAmount) || latestLog.closeAmount || '',
                    loanAmount: loanAmount || latestLog.loanAmount || '',
                    expenses: this.toNum(this.calculation.expenses) || latestLog.expenses || 0,
                    remainingAmount: remaining || latestLog.remainingAmount || '',
                    interestRate: this.toNum(this.calculation.interestRate) || latestLog.interestRate || '',
                    months: this.toNum(this.calculation.terms) || latestLog.months || '',
                    monthlyPay: this.computedMonthlyPay || latestLog.monthlyPay || '',
                    campaign: latestLog.campaign || '',
                    callDate: latestLog.callDate || new Date().toISOString().substr(0, 10),
                    callTime: latestLog.callTime || new Date().toTimeString().substr(0, 5),
                    appointment: latestLog.appointment || '',
                    accountStatus: latestLog.accountStatus || '',
                    lastActive: latestLog.lastActive || '',
                    termsTotal: latestLog.termsTotal || '',
                    termsPaid: latestLog.termsPaid || '',
                    callStatus: latestLog.callStatus || lead.call || '',
                    interest: latestLog.interest || lead.interest || '',
                    detail: latestLog.detail || '',
                    remarks: latestLog.remarks || ''
                };
            },
            onEditLog(item, index) {
                this.addLogModal.show = true;
                this.addLogModal.title = 'แก้ไขบันทึกการโทร';
                this.addLogModal.isEdit = true;
                this.addLogModal.editingIndex = index;
                this.addLogModal.tab = 0;
                this.addLogModal.lead = JSON.parse(JSON.stringify(this.logModal.currentLead));
                this.addLogModal.log = { ...item };
            },
            closeAddLog() {
                this.addLogModal.show = false;
                this.addLogModal.log = {};
                this.addLogModal.lead = {};
            },
            saveLog() {
                const leads = getLeads();
                const leadIndex = leads.findIndex(l => l.id === this.logModal.currentLead.id);
                if (leadIndex === -1) return;

                const newLog = {
                    callDate: this.addLogModal.log.callDate || '', callTime: this.addLogModal.log.callTime || '', appointment: this.addLogModal.log.appointment || '',
                    accountStatus: this.addLogModal.log.accountStatus || '', lastActive: this.addLogModal.log.lastActive || '',
                    termsTotal: parseInt(this.addLogModal.log.termsTotal) || 0, termsPaid: parseInt(this.addLogModal.log.termsPaid) || 0,
                    carPrice: parseFloat(this.addLogModal.lead.carPrice) || 0, campaign: this.addLogModal.log.campaign || '', grade: this.addLogModal.log.grade || '',
                    closeAmount: parseFloat(this.addLogModal.log.closeAmount) || 0, loanAmount: parseFloat(this.addLogModal.log.loanAmount) || 0,
                    remainingAmount: parseFloat(this.computedRemainingAmount) || 0, interestRate: parseFloat(this.addLogModal.log.interestRate) || 0,
                    months: parseInt(this.addLogModal.log.months) || 0, monthlyPay: parseFloat(this.computedMonthlyPay) || 0,
                    expenses: parseFloat(this.addLogModal.log.expenses) || 0, callStatus: this.addLogModal.log.callStatus || '',
                    interest: this.addLogModal.log.interest || '', detail: this.addLogModal.log.detail || '', remarks: this.addLogModal.log.remarks || ''
                };

                const lead = leads[leadIndex];
                lead.contract = this.addLogModal.lead.contract; lead.type = this.addLogModal.lead.type; lead.first = this.addLogModal.lead.first; lead.last = this.addLogModal.lead.last;
                lead.nick = this.addLogModal.lead.nick; lead.phone = this.addLogModal.lead.phone; lead.postal = this.addLogModal.lead.postal;
                lead.grade = this.addLogModal.lead.grade; lead.brand = this.addLogModal.lead.brand; lead.model = this.addLogModal.lead.model;
                lead.year = this.addLogModal.lead.year; lead.carPrice = this.addLogModal.lead.carPrice; lead.fullName = `${lead.first || ''} ${lead.last || ''}`;

                if (this.addLogModal.isEdit) {
                    lead.logs.splice(this.addLogModal.editingIndex, 1, newLog);
                } else {
                    if (!Array.isArray(lead.logs)) lead.logs = [];
                    lead.logs.push(newLog);
                }

                lead.interest = newLog.interest; lead.call = newLog.callStatus; lead.grade = newLog.grade;

                saveLeads(leads);
                this.closeAddLog();
                this.fetchLeads();
                this.onLog(lead);
            },
            onDeleteLog(index) {
                if (!confirm('ยืนยันการลบรายการนี้?')) return;
                const leads = getLeads();
                const leadIndex = leads.findIndex(l => l.id === this.logModal.currentLead.id);
                if (leadIndex === -1 || !Array.isArray(leads[leadIndex].logs)) return;

                leads[leadIndex].logs.splice(index, 1);
                saveLeads(leads);
                this.fetchLeads();
                this.onLog(leads[leadIndex]);
            },
            openSettings() { this.settingsModal.show = true; this.settingsModal.tab = 0; },
            closeSettings() { this.settingsModal.show = false; this.settings = getSettings(); this.fetchLeads(); },
            addSetting(key) {
                const newVal = this.settingsModal.newVal[key].trim();
                if (!newVal) return;
                const settings = getSettings();
                if (!settings[key].includes(newVal)) settings[key].push(newVal);
                saveSettings(settings);
                this.settings = getSettings();
                this.settingsModal.newVal[key] = '';
            },
            deleteSetting(key, index) {
                const settings = getSettings();
                settings[key].splice(index, 1);
                saveSettings(settings);
                this.settings = getSettings();
            },
            openImportLeadDialog() { document.getElementById('leadFileInput').click(); },
            openImportLogDialog() { document.getElementById('logFileInput').click(); },
            importLeads(event) {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    Papa.parse(e.target.result, {
                        header: true, skipEmptyLines: true, complete: (results) => {
                            let leads = getLeads();
                            const existingContracts = new Set(leads.map(l => l.contract));
                            let importedCount = 0;
                            results.data.forEach(item => {
                                const contract = (item.contract || '').trim();
                                if (!contract || existingContracts.has(contract)) return;
                                const newLead = {
                                    id: crypto.randomUUID(), contract: item.contract || '', type: item.type || '', first: item.first || '',
                                    last: item.last || '', nick: item.nick || '', phone: item.phone || '', postal: item.postal || '',
                                    grade: item.grade || '', brand: item.brand || '', model: item.model || '', year: item.year || '',
                                    carPrice: item.carPrice || '', interest: item.interest || 'รอดู', call: item.call || 'ติดต่อไม่ได้', logs: []
                                };
                                leads.push(newLead); existingContracts.add(contract); importedCount++;
                            });
                            saveLeads(leads); this.fetchLeads(); alert(`นำเข้าข้อมูลลูกค้าสำเร็จ: ${importedCount} รายการ`);
                        }
                    });
                };
                reader.readAsText(file, 'UTF-8');
            },
            importLogs(event) {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    Papa.parse(e.target.result, {
                        header: true, skipEmptyLines: true, complete: (results) => {
                            let leads = getLeads();
                            const leadMap = new Map(leads.map(l => [l.contract, l]));
                            let importedCount = 0;
                            results.data.forEach(item => {
                                const lead = leadMap.get((item.contract || '').trim());
                                if (!lead) return;
                                const newLog = {
                                    callDate: item.callDate || '', callTime: item.callTime || '', appointment: item.appointment || '',
                                    accountStatus: item.accountStatus || '', lastActive: item.lastActive || '',
                                    termsTotal: parseInt(item.termsTotal) || 0, termsPaid: parseInt(item.termsPaid) || 0,
                                    carPrice: parseFloat(item.carPrice) || 0, campaign: item.campaign || '', grade: item.grade || '',
                                    closeAmount: parseFloat(item.closeAmount) || 0, loanAmount: parseFloat(item.loanAmount) || 0,
                                    remainingAmount: parseFloat(item.remainingAmount) || 0, interestRate: parseFloat(item.interestRate) || 0,
                                    months: parseInt(item.months) || 0, monthlyPay: parseFloat(item.monthlyPay) || 0,
                                    expenses: parseFloat(item.expenses) || 0, callStatus: item.callStatus || '', interest: item.interest || '',
                                    detail: item.detail || '', remarks: item.remarks || ''
                                };
                                if (!Array.isArray(lead.logs)) lead.logs = [];
                                lead.logs.push(newLog); lead.interest = newLog.interest; lead.call = newLog.callStatus; lead.grade = newLog.grade;
                                importedCount++;
                            });
                            saveLeads(leads); this.fetchLeads(); alert(`นำเข้าข้อมูลประวัติการติดต่อสำเร็จ: ${importedCount} รายการ`);
                        }
                    });
                };
                reader.readAsText(file, 'UTF-8');
            },
            exportAllCsv() {
                const leads = getLeads();
                const flattenedData = [];
                leads.forEach(lead => {
                    const logs = lead.logs && lead.logs.length > 0 ? lead.logs : [{}];
                    logs.forEach(log => {
                        const combined = {
                            'contract': lead.contract, 'type': lead.type, 'first': lead.first, 'last': lead.last, 'nick': lead.nick,
                            'phone': lead.phone, 'postal': lead.postal, 'grade': lead.grade, 'brand': lead.brand, 'model': lead.model,
                            'year': lead.year, 'carPrice': lead.carPrice,
                            'log_callDate': log.callDate || '', 'log_callTime': log.callTime || '', 'log_appointment': log.appointment || '',
                            'log_accountStatus': log.accountStatus || '', 'log_lastActive': log.lastActive || '',
                            'log_termsTotal': log.termsTotal || '', 'log_termsPaid': log.termsPaid || '',
                            'log_carPrice': log.carPrice || '', 'log_campaign': log.campaign || '', 'log_grade': log.grade || '',
                            'log_closeAmount': log.closeAmount || '', 'log_loanAmount': log.loanAmount || '',
                            'log_remainingAmount': log.remainingAmount || '', 'log_interestRate': log.interestRate || '',
                            'log_months': log.months || '', 'log_monthlyPay': log.monthlyPay || '', 'log_expenses': log.expenses || '',
                            'log_callStatus': log.callStatus || '', 'log_interest': log.interest || '',
                            'log_detail': log.detail || '', 'log_remarks': log.remarks || '',
                        };
                        flattenedData.push(combined);
                    });
                });

                const csv = Papa.unparse(flattenedData, { header: true, quotes: true });
                const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'crm_leads_with_logs.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
        }
    });
});