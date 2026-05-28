document.addEventListener("DOMContentLoaded", async () => {
    // データをフェッチする共通関数
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error(`Could not fetch data from ${url}:`, e);
            return null;
        }
    }

    // データの読み込み
    const [therapistsData, newsData, scheduleData, blogsData] = await Promise.all([
        fetchData("data/therapists.json"),
        fetchData("data/news.json"),
        fetchData("data/schedule.json"),
        fetchData("data/blogs.json")
    ]);

    if (!therapistsData) {
        console.error("Critical: Failed to load therapists database.");
        return;
    }

    // セラピストマップ (ID -> キャスト詳細) の作成
    const therapistsMap = {};
    therapistsData.therapist_items.forEach(item => {
        therapistsMap[item.id] = item;
    });

    // セラピストカードを生成する共通ヘルパー
    function createTherapistCard(cast, overrideTime = null, isSoldout = false) {
        const card = document.createElement("div");
        card.className = "therapist-card";
        
        let newBadgeHTML = cast.is_new ? `<span class="new-badge">NEW</span>` : "";
        let soldoutOverlayHTML = isSoldout ? `
            <div class="soldout-overlay">
                <span class="soldout-badge">ご予約完売</span>
            </div>
        ` : "";
        
        card.innerHTML = `
            ${newBadgeHTML}
            <div class="therapist-card-img">
                <img src="${cast.image}" alt="${cast.name}">
                ${soldoutOverlayHTML}
            </div>
            <div class="therapist-card-info">
                <h3 class="therapist-card-name">${cast.name}</h3>
                <p class="therapist-card-meta">${cast.age} / ${cast.height}</p>
                <span class="therapist-card-time">${overrideTime || cast.time}</span>
            </div>
        `;
        return card;
    }

    // 1. トップページのお知らせ (NEWS) レンダリング
    const newsContainer = document.getElementById("news-list");
    if (newsContainer && newsData) {
        newsContainer.innerHTML = "";
        newsData.news_items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "news-item";
            itemDiv.innerHTML = `
                <span class="news-date">${item.date}</span>
                <p class="news-text"><a href="${item.link || "#"}">${item.text}</a></p>
            `;
            newsContainer.appendChild(itemDiv);
        });
    }

    // 2. トップページの新人紹介 (NEW THERAPIST) レンダリング
    const newTherapistContainer = document.getElementById("new-therapist-list");
    if (newTherapistContainer) {
        newTherapistContainer.innerHTML = "";
        const newCasts = therapistsData.therapist_items.filter(item => item.is_new);
        newCasts.forEach(cast => {
            const card = createTherapistCard(cast);
            newTherapistContainer.appendChild(card);
        });
    }

    // 3. トップページの本日出勤スケジュール (TODAY'S SCHEDULE) レンダリング
    const todayScheduleContainer = document.getElementById("today-schedule-list");
    if (todayScheduleContainer && scheduleData) {
        todayScheduleContainer.innerHTML = "";
        const todaySchedule = scheduleData.days.find(d => d.day_key === "today");
        if (todaySchedule) {
            todaySchedule.casts.forEach(castInfo => {
                const cast = therapistsMap[castInfo.therapist_id];
                if (cast) {
                    const card = createTherapistCard(cast, castInfo.time, castInfo.is_soldout);
                    todayScheduleContainer.appendChild(card);
                }
            });
        }
    }

    // 4. トップページのブログ (BLOG) レンダリング
    const blogContainer = document.getElementById("blog-list");
    if (blogContainer && blogsData) {
        blogContainer.innerHTML = "";
        // 最大3件表示
        blogsData.blog_items.slice(0, 3).forEach(item => {
            const card = document.createElement("div");
            card.className = "blog-card";
            card.innerHTML = `
                <div class="blog-card-header">
                    <span class="blog-card-date">${item.date}</span>
                    <span class="blog-card-cast">${item.cast_name}</span>
                </div>
                <h3 class="blog-card-title"><a href="#">${item.title}</a></h3>
                <p class="blog-card-summary">${item.summary}</p>
            `;
            blogContainer.appendChild(card);
        });
    }

    // 5. セラピスト一覧ページ (therapist.html) のレンダリング
    const allTherapistsContainer = document.getElementById("all-therapists-list");
    if (allTherapistsContainer) {
        allTherapistsContainer.innerHTML = "";
        therapistsData.therapist_items.forEach(cast => {
            const card = createTherapistCard(cast);
            allTherapistsContainer.appendChild(card);
        });
    }

    // 6. 出勤スケジュールページ (schedule.html) のレンダリングとタブ切り替え
    const scheduleGrid = document.getElementById("schedule-grid");
    const scheduleTabContainer = document.getElementById("schedule-tabs");

    if (scheduleGrid && scheduleTabContainer && scheduleData) {
        // タブボタンとコンテンツを動的生成
        scheduleTabContainer.innerHTML = "";
        scheduleGrid.innerHTML = "";

        scheduleData.days.forEach((day, index) => {
            // タブボタンの生成
            const tabBtn = document.createElement("button");
            tabBtn.className = `schedule-tab ${index === 0 ? "active" : ""}`;
            tabBtn.setAttribute("data-day", day.day_key);
            tabBtn.textContent = day.day_label;
            scheduleTabContainer.appendChild(tabBtn);

            // スケジュールグリッド（キャスト一覧）の生成用ラッパー
            const dayContent = document.createElement("div");
            dayContent.id = `schedule-${day.day_key}`;
            dayContent.className = `schedule-day-content ${index === 0 ? "active" : ""}`;
            dayContent.style.display = index === 0 ? "grid" : "none";

            if (day.casts && day.casts.length > 0) {
                day.casts.forEach(castInfo => {
                    const cast = therapistsMap[castInfo.therapist_id];
                    if (cast) {
                        const card = createTherapistCard(cast, castInfo.time, castInfo.is_soldout);
                        dayContent.appendChild(card);
                    }
                });
            } else {
                dayContent.innerHTML = '<p class="no-schedule" style="grid-column: 1/-1; text-align: center; color: var(--color-gold); font-family: var(--font-serif); padding: 40px 0;">出勤予定はありません。</p>';
            }
            scheduleGrid.appendChild(dayContent);
        });

        // タブのイベントリスナー設定
        const tabButtons = scheduleTabContainer.querySelectorAll(".schedule-tab");
        const dayContents = scheduleGrid.querySelectorAll(".schedule-day-content");

        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetDay = btn.getAttribute("data-day");

                tabButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                dayContents.forEach(content => {
                    if (content.id === `schedule-${targetDay}`) {
                        content.style.display = "grid";
                        content.classList.add("active");
                    } else {
                        content.style.display = "none";
                        content.classList.remove("active");
                    }
                });
            });
        });
    }
});
