// Core transaction database store - dynamic ledger data
let transactions = [];
let initialBudget = 0;
let hasSetBudget = false;

const FINANCIAL_CAMPAIGNS = [
    {
        title: 'SmartInvest: Early Retirement',
        desc: 'Learn the 3 keys to building a robust passive income stream. Free webinar tonight.',
        promo: 'USE CODE "SMART20" TO RESERVE SEAT',
        img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
        title: 'American Express Gold Card',
        desc: 'Earn 60,000 Membership Rewards points after spending $4,000 in the first 6 months.',
        promo: 'CODE "AMEXGOLD60K" FOR BONUS',
        img: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
        title: 'Apex Tax & Audit Services',
        desc: 'Maximize deductions and safeguard your corporate holdings. Save $450 on first audit.',
        promo: 'CLAIM PRIORITY TAX CODE: TAXREFUND26',
        img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
        title: 'Acme High-Yield Index Fund',
        desc: 'Consolidated index tracking with record 14.8% historical annual return yields. $50 deposit bonus.',
        promo: 'CLAIM BONUS CODE: ACMEGROWTH',
        img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
        title: 'Wealthy Mind Luxury Ledger',
        desc: 'Hardcover vegan leather financial planners to catalog investments offline.',
        promo: 'GET 25% OFF PLANNER: LEDGER25',
        img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
        title: 'FinTech Capital Daily Desk',
        desc: 'Direct micro-finance briefs on stock fluctuations, interest cuts, and treasury bonds.',
        promo: 'FREE NEWSLETTER SEAT: DAILYCAP',
        img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&h=200&q=80'
    }
];

let adsDisabled = false;
let interactionCount = 0;

// --- 1. Dynamic Ledger Rendering ---
function renderLedger() {
    const list = document.getElementById('transaction-list-feed');
    if (!list) return;

    list.innerHTML = '';
    
    // Set up calculations
    let balance = initialBudget;
    let totalExpenses = 0;
    
    transactions.forEach(txn => {
        balance += txn.amount;
        if (txn.amount < 0) {
            totalExpenses += Math.abs(txn.amount);
        }
    });

    transactions.forEach((txn, index) => {
        const div = document.createElement('div');
        div.className = 'transaction';
        div.style.cursor = 'pointer';
        div.onclick = () => {
            showSessionInterstitialAd(() => {
                openDetail(txn, index);
            });
        };
        
        const sign = txn.amount > 0 ? '+' : '-';
        const amtClass = txn.amount > 0 ? 'positive' : 'negative';
        
        div.innerHTML = `
            <div class="t-icon">${txn.icon}</div>
            <div class="t-info">
                <h4>${txn.merchant}</h4>
                <p>${txn.date} &bull; ${txn.category}</p>
            </div>
            <div class="t-amount ${amtClass}">${sign}$${Math.abs(txn.amount).toFixed(2)}</div>
        `;
        list.appendChild(div);
        
        // Dynamic sponsored ad placement inside feed list
        if ((index + 1) % 3 === 0) {
            const campaignIndex = Math.floor(index / 3) % FINANCIAL_CAMPAIGNS.length;
            const campaign = FINANCIAL_CAMPAIGNS[campaignIndex];
            
            const adDiv = document.createElement('div');
            adDiv.className = 'transaction ad-exp';
            adDiv.style.borderLeft = '4px solid var(--primary)';
            adDiv.innerHTML = `
                <div class="t-icon" style="background:#e6f7f0; color:var(--primary);">🎯</div>
                <div class="t-info">
                    <span style="font-size:0.6rem; font-weight:800; color:var(--primary); letter-spacing:1px; text-transform:uppercase;">SPONSORED CAMPAIGN</span>
                    <h4 style="margin-top:0.1rem;">${campaign.title}</h4>
                    <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">${campaign.desc}</p>
                </div>
                <button class="ad-btn" style="padding:0.4rem 1rem; font-size:0.75rem; border-radius:6px;" onclick="event.stopPropagation(); alert('🎉 Redirecting to sponsor portal! Promo copied.')">Claim</button>
            `;
            list.appendChild(adDiv);
        }
    });

    // Animate and update totals
    const balanceDisplay = document.getElementById('total-balance-display');
    const expensesDisplay = document.getElementById('total-expenses-display');
    const budgetStatus = document.getElementById('budget-status');
    const expenseStatus = document.getElementById('expense-status');
    const budgetEstimates = document.getElementById('budget-estimates');
    
    if (balanceDisplay) balanceDisplay.innerText = `$${balance.toFixed(2)}`;
    if (expensesDisplay) expensesDisplay.innerText = `$${totalExpenses.toFixed(2)}`;
    
    if (budgetStatus && hasSetBudget) {
        let percentLeft = ((balance / initialBudget) * 100).toFixed(1);
        budgetStatus.innerText = `${percentLeft}% of budget remaining`;
        budgetStatus.className = balance > (initialBudget * 0.2) ? 'trend up' : 'trend down';
    }
    
    if (expenseStatus && hasSetBudget) {
        expenseStatus.innerText = `${transactions.length} transactions logged`;
    }

    if (budgetEstimates && hasSetBudget) {
        let needs = (initialBudget * 0.50).toFixed(2);
        let wants = (initialBudget * 0.30).toFixed(2);
        let savings = (initialBudget * 0.20).toFixed(2);
        
        budgetEstimates.innerHTML = `
            <strong>Needs (50%):</strong> $${needs}<br>
            <strong>Wants (30%):</strong> $${wants}<br>
            <strong>Savings (20%):</strong> $${savings}
        `;
    }
}

// Function to handle initial budget submission
function submitInitialBudget() {
    const budgetInput = document.getElementById('initial-budget-input');
    if (!budgetInput || isNaN(parseFloat(budgetInput.value)) || parseFloat(budgetInput.value) <= 0) {
        alert("Please enter a valid budget greater than 0.");
        return;
    }
    
    initialBudget = parseFloat(budgetInput.value);
    hasSetBudget = true;
    
    const modal = document.getElementById('budgetPromptModal');
    if (modal) modal.style.display = 'none';
    
    renderLedger();
}

// Transaction item inspector details modal
function openDetail(txn, id) {
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    const heroPool = [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=600&q=80", // Office desk
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&h=600&q=80", // Graph chart
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=600&q=80"  // Business consultant
    ];
    const randomHero = heroPool[id % heroPool.length];
    
    const sign = txn.amount > 0 ? '+' : '-';
    const amountColor = txn.amount > 0 ? 'var(--primary)' : 'var(--danger)';

    body.innerHTML = `
        <div class="modal-hero" style="background:url('${randomHero}') center/cover; height:260px; border-radius:16px; margin-bottom:2rem; box-shadow:0 10px 25px rgba(0,0,0,0.05);"></div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 2rem;">
            <div>
                <h2 style="font-size:2.2rem; margin-bottom:0.4rem; color:var(--text);">${txn.merchant}</h2>
                <p style="color:var(--text-muted); font-size:0.95rem;">Logged Date: ${txn.date}</p>
            </div>
            <div style="font-size:2.4rem; font-weight:700; color:${amountColor}">${sign}$${Math.abs(txn.amount).toFixed(2)}</div>
        </div>
        
        <div class="extensive-info" style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:2rem;">
            <div style="background:#f8fafc; padding:1.8rem; border-radius:16px; border:1px solid var(--border);">
                <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text);">Ledger Details</h3>
                <ul style="list-style:none; padding:0; color:var(--text-muted); font-size:0.9rem; display:flex; flex-direction:column; gap:0.5rem;">
                    <li><strong>Category:</strong> ${txn.category}</li>
                    <li><strong>Status:</strong> Ledger Synchronized</li>
                    <li><strong>Reference:</strong> #SMART-${txn.id + 10000}</li>
                </ul>
            </div>
            <div style="background:#f8fafc; padding:1.8rem; border-radius:16px; border:1px solid var(--border);">
                <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text);">Audit Insight</h3>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5;">This cashflow metric contributes to your monthly smart balance analytics. You spent a total of $${(Math.abs(txn.amount) * 3.5).toFixed(2)} within this node cluster this year.</p>
            </div>
        </div>
    `;
    
    // Choose sponsored asset inside details popup
    const detailCampaign = FINANCIAL_CAMPAIGNS[id % FINANCIAL_CAMPAIGNS.length];
    const detailImg = document.getElementById('detail-ad-img');
    const detailTitle = document.getElementById('detail-ad-title');
    const detailDesc = document.getElementById('detail-ad-desc');
    
    if (detailImg) detailImg.src = detailCampaign.img;
    if (detailTitle) detailTitle.innerText = detailCampaign.title;
    if (detailDesc) detailDesc.innerText = detailCampaign.desc;

    modal.style.display = 'flex';
}

document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('detailModal').style.display = 'none';
});

window.onclick = (event) => {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


// --- 2. Dynamic Transaction Creation System ---
const transactionModal = document.getElementById('transactionModal');
const btnOpenAddTransaction = document.getElementById('btn-open-add-transaction');
const btnCloseTransactionModal = document.getElementById('btn-close-transaction-modal');

if (btnOpenAddTransaction) {
    btnOpenAddTransaction.addEventListener('click', () => {
        // Set standard date to today
        const dateInput = document.getElementById('txn-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        
        if (transactionModal) transactionModal.style.display = 'flex';
    });
}

if (btnCloseTransactionModal) {
    btnCloseTransactionModal.addEventListener('click', () => {
        if (transactionModal) transactionModal.style.display = 'none';
    });
}

function submitNewTransaction() {
    const merchant = document.getElementById('txn-merchant').value;
    const amountVal = parseFloat(document.getElementById('txn-amount').value);
    const type = document.getElementById('txn-type').value;
    const category = document.getElementById('txn-category').value;
    const rawDate = document.getElementById('txn-date').value;

    if (!merchant || isNaN(amountVal) || !rawDate) {
        alert('❌ Please complete all transaction parameters before syncing.');
        return;
    }

    const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const categoryIcons = {
        Lifestyle: '🛒',
        Dining: '☕',
        Utilities: '💻',
        Income: '💵'
    };

    const newTxn = {
        id: transactions.length + 1,
        merchant,
        date: formattedDate,
        amount: type === 'expense' ? -amountVal : amountVal,
        type,
        category,
        icon: categoryIcons[category] || '💸'
    };

    if (transactionModal) transactionModal.style.display = 'none';
    document.getElementById('transaction-form').reset();

    // Trigger standard ad skip interstitial before committing to database feed!
    showSessionInterstitialAd(() => {
        transactions.unshift(newTxn);
        renderLedger();
        
        // Play progress bar transitions
        const fill = document.querySelector('.fill');
        if (fill) {
            fill.style.width = '0';
            setTimeout(() => {
                fill.style.transition = 'width 1s ease-in-out';
                fill.style.width = '85%';
            }, 200);
        }
    });
}


// --- 3. Programmatic Rotating Sponsor Banner ---
let bannerIndex = 0;
function startRotatingBanner() {
    const banner = document.getElementById('floating-ad-banner');
    if (!banner || adsDisabled) return;

    const campaign = FINANCIAL_CAMPAIGNS[bannerIndex];
    bannerIndex = (bannerIndex + 1) % FINANCIAL_CAMPAIGNS.length;

    banner.innerHTML = `
        <div class="ad-sponsor-container">
            <img src="${campaign.img}" alt="${campaign.title}">
            <div class="banner-content">
                <p>Curated Wealth Sponsor</p>
                <strong>${campaign.title}</strong>
            </div>
        </div>
        <div class="banner-actions">
            <button class="btn-banner-action" id="btn-banner-claim">Claim Coupon</button>
            <button class="btn-banner-close" id="btn-banner-close">×</button>
        </div>
    `;

    banner.style.display = 'flex';

    // Hook listeners
    document.getElementById('btn-banner-claim')?.addEventListener('click', () => {
        alert(`🎉 Copied promo code: "${campaign.promo.split('"')[1] || 'SAVESMART'}" to clipboard!`);
        window.open('#', '_blank');
    });

    document.getElementById('btn-banner-close')?.addEventListener('click', () => {
        banner.style.display = 'none';
    });
}

// Initial banner launch and rotate every 10 seconds
setTimeout(() => {
    startRotatingBanner();
    setInterval(startRotatingBanner, 10000);
}, 2000);


// --- 4. Decoupled Timed Interstitial Countdown System ---
let interstitialCallback = null;
let interstitialTimer = null;
const interstitialModal = document.getElementById('interstitialModal');
const btnSkipAd = document.getElementById('btn-skip-ad');
const btnClaimAd = document.getElementById('btn-claim-ad');

function showSessionInterstitialAd(onClosed) {
    if (adsDisabled || !interstitialModal) {
        onClosed();
        return;
    }
    
    interstitialCallback = onClosed;
    
    // Choose a random campaign
    const campaign = FINANCIAL_CAMPAIGNS[Math.floor(Math.random() * FINANCIAL_CAMPAIGNS.length)];
    const imgEl = document.getElementById('interstitial-ad-img');
    const titleEl = document.getElementById('interstitial-ad-title');
    const descEl = document.getElementById('interstitial-ad-desc');
    const promoEl = document.getElementById('interstitial-ad-promo');
    
    if (imgEl) imgEl.src = campaign.img;
    if (titleEl) titleEl.innerText = campaign.title;
    if (descEl) descEl.innerText = campaign.desc;
    if (promoEl) promoEl.innerText = campaign.promo;

    interstitialModal.style.display = 'flex';
    
    btnSkipAd.disabled = true;
    btnSkipAd.style.opacity = '0.4';
    btnSkipAd.style.cursor = 'not-allowed';
    btnSkipAd.innerText = 'Skip Ad in 5s';
    
    let count = 5;
    if (interstitialTimer) clearInterval(interstitialTimer);
    
    interstitialTimer = setInterval(() => {
        count--;
        if (count > 0) {
            btnSkipAd.innerText = `Skip Ad in ${count}s`;
        } else {
            clearInterval(interstitialTimer);
            btnSkipAd.innerText = 'Skip Ad';
            btnSkipAd.disabled = false;
            btnSkipAd.style.opacity = '1';
            btnSkipAd.style.cursor = 'pointer';
        }
    }, 1000);
}

if (btnSkipAd) {
    btnSkipAd.addEventListener('click', () => {
        interstitialModal.style.display = 'none';
        
        // Trigger success synchronization celebration modal!
        const celebrationModal = document.getElementById('celebrationModal');
        if (celebrationModal) {
            celebrationModal.style.display = 'flex';
        } else if (interstitialCallback) {
            interstitialCallback();
        }
    });
}

if (btnClaimAd) {
    btnClaimAd.addEventListener('click', () => {
        alert('🎉 Promo registered! Directing to partner investment forms.');
        interstitialModal.style.display = 'none';
        
        const celebrationModal = document.getElementById('celebrationModal');
        if (celebrationModal) {
            celebrationModal.style.display = 'flex';
        } else if (interstitialCallback) {
            interstitialCallback();
        }
    });
}

// Celebration close handler
const btnCloseCelebrationModal = document.getElementById('btn-close-celebration');
if (btnCloseCelebrationModal) {
    btnCloseCelebrationModal.addEventListener('click', () => {
        document.getElementById('celebrationModal').style.display = 'none';
        if (interstitialCallback) {
            interstitialCallback();
            interstitialCallback = null;
        }
    });
}


// --- 5. Scarcity Upgrade Tier & Timer Engine ---
let upgradeTimer = null;
const premiumUpgradeModal = document.getElementById('premiumUpgradeModal');

function triggerUpgradeModal() {
    if (adsDisabled || !premiumUpgradeModal) return;
    
    premiumUpgradeModal.style.display = 'flex';
    let duration = 600; // 10 minutes
    const countdownEl = document.getElementById('scarcity-countdown');

    if (upgradeTimer) clearInterval(upgradeTimer);

    upgradeTimer = setInterval(() => {
        duration--;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        if (countdownEl) {
            countdownEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        if (duration <= 0) {
            clearInterval(upgradeTimer);
            premiumUpgradeModal.style.display = 'none';
        }
    }, 1000);
}

// Trigger upgrade modal after 40 seconds of active ledger management
setTimeout(triggerUpgradeModal, 40000);

document.getElementById('btn-skip-upgrade')?.addEventListener('click', () => {
    premiumUpgradeModal.style.display = 'none';
    clearInterval(upgradeTimer);
});

// Acknowledge upgrade purchase (disable ads)
document.getElementById('btn-upgrade-now')?.addEventListener('click', () => {
    alert('🏆 Welcome to SaveSmart Platinum! Ad integrations have been silenced.');
    adsDisabled = true;
    premiumUpgradeModal.style.display = 'none';
    const banner = document.getElementById('floating-ad-banner');
    if (banner) banner.style.display = 'none';
    clearInterval(upgradeTimer);
});


// --- 6. Exit Intent & Mock Ad-Blocker Overlays ---
let exitIntentShown = false;
document.addEventListener("mouseout", (e) => {
    if (e.clientY < 0 && !exitIntentShown && !adsDisabled) {
        exitIntentShown = true;
        const exitModal = document.getElementById("exitIntentModal");
        if (exitModal) exitModal.style.display = "flex";
    }
});

document.getElementById("closeExitIntent")?.addEventListener("click", () => {
    document.getElementById("exitIntentModal").style.display = "none";
});
document.getElementById("declineExitIntent")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("exitIntentModal").style.display = "none";
});

// Trigger Mock ad blocker Whitelist popups after 5 seconds
setTimeout(() => {
    if (adsDisabled) return;
    const isAdBlockerActive = Math.random() < 0.15; // 15% simulation chance
    if (isAdBlockerActive) {
        const adBlockModal = document.getElementById("adBlockModal");
        if (adBlockModal) adBlockModal.style.display = "flex";
    }
}, 5000);

document.getElementById('btn-adblock-premium')?.addEventListener('click', () => {
    alert('🏆 Platinum Activated! Dynamic career ads disabled.');
    adsDisabled = true;
    document.getElementById("adBlockModal").style.display = "none";
    const banner = document.getElementById('floating-ad-banner');
    if (banner) banner.style.display = 'none';
});

// Window load triggers
window.onload = () => {
    if (!hasSetBudget) {
        const promptModal = document.getElementById('budgetPromptModal');
        if (promptModal) promptModal.style.display = 'flex';
    }
    renderLedger();
};
