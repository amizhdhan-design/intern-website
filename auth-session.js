/**
 * InternLocate - Unified Authentication & Persistent Session Controller
 * Enforces mandatory login before searching.
 * Once a student logs in or registers ONCE, their session is saved permanently 
 * in localStorage and they NEVER need to log in or sign up again.
 */

const authSession = {
    STORAGE_KEY: "internlocate_student",

    // Get current logged-in user object or null
    getUser() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error("Failed to parse user session", e);
            return null;
        }
    },

    // Check if user is logged in (persistent check)
    isLoggedIn() {
        const user = this.getUser();
        return !!(user && (user.fullName || user.email));
    },

    // Enforce mandatory login gate. Call on pages that require authentication.
    requireAuth(redirectUrl) {
        if (!this.isLoggedIn()) {
            const target = redirectUrl || (window.location.pathname + window.location.search);
            const loginUrl = `login.html?redirect=${encodeURIComponent(target)}&authRequired=1`;
            window.location.href = loginUrl;
            return false;
        }
        return true;
    },

    // Store user login permanently and redirect
    loginUser(userData, targetUrl, showWelcome = true) {
        if (!userData || (!userData.email && !userData.fullName)) {
            alert("Please provide valid student credentials.");
            return false;
        }
        userData.loginTimestamp = new Date().toISOString();
        userData.permanentSession = true;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        
        if (showWelcome) {
            alert(`🎉 Welcome ${userData.fullName}!\n\nYour student profile has been saved permanently in this browser.\nYou will NEVER need to log in or sign up again to search companies.`);
        }

        const destination = targetUrl || "companies.html";
        window.location.href = destination;
        return true;
    },

    // Log out user only when explicitly clicked
    logoutUser() {
        if (confirm("Are you sure you want to sign out of InternLocate? You will need to re-authenticate to search companies.")) {
            localStorage.removeItem(this.STORAGE_KEY);
            window.location.href = "login.html?logout=1";
        }
    },

    // Quick demo student / admin login helper for 1-click review
    loginAsDemoStudent(targetUrl) {
        const demoUser = {
            fullName: "Amizhdhan R.",
            email: "amizhdhan.admin@kongu.edu",
            phone: "+91 98427 12345",
            college: "Kongu Engineering College (KEC), Perundurai, Erode",
            department: "Computer Science & Engineering",
            year: "3rd Year",
            homeDistrict: "Erode",
            address: "Kongu Engineering College Campus, Perundurai, Erode District, Tamil Nadu - 638060",
            accountType: "Platform Admin & Student"
        };
        this.loginUser(demoUser, targetUrl, true);
    },

    // Update navbar badges and account cards dynamically across all pages
    updateNavbar() {
        const user = this.getUser();
        const sessionContainer = document.getElementById("sessionUserDisplay");
        const sidebarAccount = document.getElementById("sidebarAuthAccount");
        const heroAuthBanner = document.getElementById("heroAuthBanner");
        const sidebarLoginLink = document.getElementById("sidebarLoginLink");

        if (user && user.fullName) {
            const firstName = user.fullName.split(" ")[0];
            const deptShort = user.department ? user.department.split("/")[0].trim() : "Student";
            
            // Top Nav Header Pill
            if (sessionContainer) {
                sessionContainer.innerHTML = `
                    <div class="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1.5 rounded-pill border border-white border-opacity-25 shadow-sm text-white">
                        <i class="fa-solid fa-circle-check text-success fs-6"></i>
                        <span class="small fw-semibold text-truncate" style="max-width: 170px;" title="${user.fullName} (${user.college})">
                            ${firstName} (${deptShort})
                        </span>
                        <button type="button" onclick="authSession.logoutUser()" class="btn btn-sm btn-link text-white-50 hover-text-white ms-1 p-0 border-0" title="Sign Out">
                            <i class="fa-solid fa-right-from-bracket text-warning"></i>
                        </button>
                    </div>
                `;
            }

            // Left Sidebar Account Block
            if (sidebarAccount) {
                sidebarAccount.innerHTML = `
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="fa-solid fa-circle-user text-primary fs-4"></i>
                        <div class="text-start text-truncate">
                            <div class="fw-bold small text-dark text-truncate">${user.fullName}</div>
                            <small class="text-muted" style="font-size: 11px;">${user.college ? user.college.split(',')[0] : 'Verified Student'}</small>
                        </div>
                    </div>
                    <div class="badge bg-success-subtle text-success w-100 py-1 mb-2 small fw-bold">
                        <i class="fa-solid fa-check-double me-1"></i>Permanent Session Active
                    </div>
                    <button onclick="authSession.logoutUser()" class="btn btn-outline-danger btn-sm rounded-pill w-100 fw-semibold" style="font-size: 12px;">
                        <i class="fa-solid fa-right-from-bracket me-1"></i> Sign Out
                    </button>
                `;
            }

            // Sidebar navigation link
            if (sidebarLoginLink) {
                sidebarLoginLink.innerHTML = `<i class="fa-solid fa-user-check me-3 text-success"></i>My Profile (Active)`;
                sidebarLoginLink.href = "companies.html";
            }

            // Hero section status banner on index.html
            if (heroAuthBanner) {
                heroAuthBanner.innerHTML = `
                    <span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1.5 rounded-pill fw-bold">
                        <i class="fa-solid fa-circle-check me-1"></i> Logged In as ${firstName} (${user.department ? user.department.split('/')[0] : 'Student'}) &bull; Search Fully Unlocked
                    </span>
                `;
            }

        } else {
            // Not Logged In State
            if (sessionContainer) {
                sessionContainer.innerHTML = `
                    <a href="login.html" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm">
                        <i class="fa-solid fa-arrow-right-to-bracket me-1"></i> Student Login
                    </a>
                `;
            }

            if (sidebarAccount) {
                sidebarAccount.innerHTML = `
                    <small class="text-secondary d-block mb-2">Tamil Nadu Student Portal</small>
                    <a href="login.html" class="btn btn-brand btn-sm rounded-pill w-100 fw-bold">
                        <i class="fa-solid fa-user-check me-1"></i> Account Access
                    </a>
                `;
            }

            if (sidebarLoginLink) {
                sidebarLoginLink.innerHTML = `<i class="fa-solid fa-id-badge me-3 text-primary"></i>Student Login / Register`;
                sidebarLoginLink.href = "login.html";
            }

            if (heroAuthBanner) {
                heroAuthBanner.innerHTML = `
                    <span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-1.5 rounded-pill fw-bold">
                        <i class="fa-solid fa-lock me-1"></i> Mandatory Student Login Required to Access Directory
                    </span>
                `;
            }
        }
    }
};

// Global helper wrappers for backward compatibility with inline handlers
function checkUserSession() {
    authSession.updateNavbar();
}

function logoutUser() {
    authSession.logoutUser();
}

// Auto-run on DOM ready
document.addEventListener("DOMContentLoaded", function () {
    authSession.updateNavbar();
});