const mount = document.getElementById('scene3d');
if (mount) {
  (async function bootHabu3D() {
    const status = document.getElementById('sceneStatus');
    const detailTitle = document.getElementById('hotTitle');
    const detailText = document.getElementById('hotText');
    const stageLabel = document.getElementById('stageLabel');
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';
    const say = (ar, en) => lang() === 'ar' ? ar : en;
    try {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x101c18);
      scene.fog = new THREE.Fog(0x101c18, 32, 95);
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 180);
      camera.position.set(29, 24, 36);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D model of Medinet Habu');
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.enablePan = true;
      controls.minDistance = 5;
      controls.maxDistance = 90;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.target.set(0, 1, 0);

      scene.add(new THREE.HemisphereLight(0xe6d7b6, 0x25382f, 2.0));
      const keyLight = new THREE.DirectionalLight(0xffd9a0, 2.5);
      keyLight.position.set(-14, 28, 16);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x8cb4a0, 1.1);
      rimLight.position.set(16, 16, -18);
      scene.add(rimLight);
      const fillLight = new THREE.PointLight(0xc9a85b, 70, 45);
      fillLight.position.set(0, 8, 3);
      scene.add(fillLight);

      const world = new THREE.Group();
      scene.add(world);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const clickable = [];
      let currentScene = 'complex';
      let selectedObject = null;
      let dust = null;

      const mats = {
        sandstone: new THREE.MeshStandardMaterial({ color: 0xb99a68, roughness: 0.92 }),
        sandstoneLight: new THREE.MeshStandardMaterial({ color: 0xd7bd8e, roughness: 0.9 }),
        sandstoneDark: new THREE.MeshStandardMaterial({ color: 0x8d704a, roughness: 0.95 }),
        mudbrick: new THREE.MeshStandardMaterial({ color: 0x8b6348, roughness: 1 }),
        darkBrick: new THREE.MeshStandardMaterial({ color: 0x5d4738, roughness: 1 }),
        gold: new THREE.MeshStandardMaterial({ color: 0xc9a85b, metalness: 0.2, roughness: 0.55 }),
        green: new THREE.MeshStandardMaterial({ color: 0x315849, roughness: 0.88 }),
        shadow: new THREE.MeshStandardMaterial({ color: 0x1b2822, roughness: 0.95 }),
        relief: new THREE.MeshStandardMaterial({ color: 0xd0b17d, roughness: 0.93 }),
        reliefHi: new THREE.MeshStandardMaterial({ color: 0xe2c995, roughness: 0.85 }),
        water: new THREE.MeshStandardMaterial({ color: 0x315d68, metalness: 0.12, roughness: 0.28 })
      };

      const info = {
        gate: {
          ar: ['البوابة العالية', 'مدخل شرقي محصّن يتوسط سورًا ضخمًا من الطوب اللبن. يتكون من برجين وغرف داخلية ومستويات علوية. يشرح الدليل الأثري أن الوصول النهري كان يتم عبر قناة ومرسى، وأن البوابة الشرقية أصبحت المدخل المعروف للزوار اليوم.'],
          en: ['The High Gate', 'A fortified eastern entrance in the massive mud-brick enclosure. It comprises two towers, internal rooms, and upper levels. The archaeological guide describes river access through a canal and landing basin; the eastern gate is the familiar visitor entrance today.']
        },
        pylon1: {
          ar: ['الصرح الأول', 'واجهة حجرية ضخمة تفتتح المسار الرسمي إلى المعبد. الصروح في العمارة المصرية ليست بوابات فقط؛ إنها واجهات ملكية تعرض صور القوة والنظام، ومنها مشاهد الملك وهو يضرب أعداءه أمام الآلهة.'],
          en: ['First Pylon', 'A monumental stone façade opening the formal approach to the temple. Pylons are more than gateways: they are royal façades displaying power and order, including scenes of the king smiting enemies before the gods.']
        },
        court1: {
          ar: ['الفناء الأول', 'فضاء مفتوح يلي الصرح الأول. تربطه نافذة الظهور والقصر الملكي جنوبًا بالمناسبات الرسمية؛ فالملك كان يستطيع الظهور ومشاهدة المواكب وتقديم المكافآت في إطار الطقس والسلطة.'],
          en: ['First Court', 'An open court beyond the First Pylon. The appearance window and palace to its south linked this space to formal events, allowing the king to appear, view processions, and distribute rewards within a ritual setting.']
        },
        pylon2: {
          ar: ['الصرح الثاني', 'يشكل حدًا معماريًا ثانيًا بين الفناء الخارجي والنطاق الداخلي. تعاقب الصروح والأفنية يصنع انتقالًا تدريجيًا من المجال العام إلى فضاءات أكثر تقييدًا وقداسة.'],
          en: ['Second Pylon', 'A second architectural threshold between the outer court and inner temple. The sequence of pylons and courts creates a gradual movement from public space toward more restricted and sacred areas.']
        },
        court2: {
          ar: ['الفناء الثاني والرواق', 'تظهر هنا عناصر أوزيرية ومشاهد طقسية واحتفالية. وتضم مناطق الفناء أيضًا أجزاء من السجل التاريخي المصور، ما يجعلها نقطة مهمة لقراءة اجتماع الطقس والسياسة على جدران المعبد.'],
          en: ['Second Court and Portico', 'Osiride elements and ritual and festival scenes appear in this zone. Parts of the historical relief programme are also found around the courts, making this an important place to understand the overlap of ritual and politics.']
        },
        hypostyle: {
          ar: ['قاعات الأعمدة', 'يذكر الوصف الرسمي ثلاث قاعات للأعمدة قبل مجموعة المقاصير وقدس الأقداس. تشمل العناصر أعمدة مستديرة بتيجان مستوحاة من البردي ودعامات أوزيرية تجسد الملك في هيئة أوزير.'],
          en: ['Column Halls', 'The official description lists three column halls before the chapels and Holy of Holies. Elements include round columns with papyrus-inspired capitals and Osiride pillars portraying the king in an Osirian form.']
        },
        sanctuary: {
          ar: ['المقاصير وقدس الأقداس', 'تقع المقاصير وقدس الأقداس في أعمق النطاقات الشعائرية. يوضح التسلسل المعماري أن الحركة داخل المعبد تقود من الفناءات المفتوحة إلى حجرات أكثر خصوصية، وتلي قدس الأقداس غرف خلفية.'],
          en: ['Chapels and Sanctuary', 'The chapels and Holy of Holies occupy the innermost ritual zone. The architectural sequence moves from open courts to increasingly restricted rooms, with additional chambers behind the sanctuary.']
        },
        palace: {
          ar: ['القصر الملكي', 'توجد بقايا القصر جنوب المعبد. ويصف المسح المعماري مراحل قصريّة متعاقبة، وقاعات استقبال وعرش وأجنحة خاصة. ترتبط نافذة الظهور بالفناء الأول وتكشف عن تداخل المجال الملكي مع الفضاء الشعائري.'],
          en: ['Royal Palace', 'Palace remains lie south of the temple. The architectural survey describes successive palace phases with audience and throne halls and private suites. The appearance window connected the palace to the First Court, joining royal and ritual space.']
        },
        magazines: {
          ar: ['المخازن وورش الخدمة', 'تُظهر نتائج الحفائر أن المجمع يضم وحدات تخزين وورشًا ومباني إدارية وخدمية. هذه المنشآت أساسية لفهم المعبد كمؤسسة اقتصادية وإدارية، لا كمكان للطقس وحده.'],
          en: ['Magazines and Service Workshops', 'Excavation records show storerooms, workshops, and administrative and service buildings. These structures are essential to understanding the temple as an economic and administrative institution, not only a place of ritual.']
        },
        smallTemple: {
          ar: ['معبد آمون الصغير', 'معبد أقدم من مجمع رمسيس الثالث، بُنيت نواته في الأسرة الثامنة عشرة على موضع ذي قداسة أقدم. يربط مشروع ARCE الموقع بالتل المقدس والأجدود، مع التأكيد أن هذه قراءة للتقليد الديني المصري.'],
          en: ['Small Temple of Amun', 'An older temple whose Eighteenth-Dynasty core stands on a place of earlier sanctity. ARCE connects the site with the sacred mound and the Ogdoad, as part of Egyptian religious tradition.']
        },
        wall: {
          ar: ['السور الطيني', 'أحاط رمسيس الثالث بالمجمع سور ضخم من الطوب اللبن، يحدد نطاق الحرم ويحوي غرف حراسة. تربط وزارة السياحة والآثار تحصين المنطقة بالظروف السياسية والتهديدات التي شهدها الغرب في عصر الملك.'],
          en: ['Mud-brick Enclosure', 'Ramesses III surrounded the precinct with a massive mud-brick wall defining the sacred enclosure and incorporating guard rooms. The Ministry links the defensive character of the area to political conditions and threats from the west during the king’s reign.']
        },
        column: {
          ar: ['عمود بردي', 'تُظهر تيجان بعض الأعمدة أشكالًا نباتية مستوحاة من نبات البردي. هذه المحاكاة للنباتات ليست زخرفة عشوائية، بل جزء من لغة رمزية مصرية تربط العمارة بمشهد الطبيعة والخلق والتجدد.'],
          en: ['Papyrus Column', 'Some capitals imitate the papyrus plant. Such botanical forms are not random decoration; they belong to an Egyptian symbolic language connecting architecture with nature, creation, and renewal.']
        },
        osiride: {
          ar: ['دعامة أوزيرية', 'تُظهر الدعامة الملك في هيئة مرتبطة بأوزير، إله البعث والعالم الآخر. إنها صيغة معمارية-نحتية تربط الملك بالاستمرار والتجدد بعد الموت.'],
          en: ['Osiride Pillar', 'The pillar presents the king in a form associated with Osiris, god of renewal and the afterlife. This architectural-sculptural form links kingship with continuity and regeneration after death.']
        },
        relief: {
          ar: ['النقش الملكي', 'تسجل الجدران حملات عسكرية وطقوسًا واحتفالات. ينبغي قراءة الصورة الملكية باعتبارها وثيقة سياسية ودينية، ومقارنتها بالنصوص والمصادر الأخرى بدل التعامل معها كصورة محايدة حرفية.'],
          en: ['Royal Relief', 'The walls record campaigns, rituals, and festivals. Royal imagery should be read as political and religious documentation and compared with texts and other evidence, rather than treated as a neutral literal picture.']
        },
        king: {
          ar: ['الملك رمسيس الثالث', 'يُؤرخ حكمه عادة بنحو 1184–1153 ق.م في التسلسل الذي تعتمده وزارة السياحة والآثار المصرية. خاض حملات ضد الليبيين وجماعات الشمال، وجعل من المعبد سجلًا بصريًا لشرعية حكمه وعبادته الملكية.'],
          en: ['Ramesses III', 'His reign is commonly dated c. 1184–1153 BCE in the chronology used by Egypt’s Ministry of Tourism and Antiquities. He campaigned against Libyan groups and northern coalitions and made the temple a visual record of royal legitimacy and cult.']
        },
        sea: {
          ar: ['مناظر السنة الثامنة', 'تسجل نصوص ومناظر السنة الثامنة تحالفًا من جماعات شمالية، وتصور مواجهة برية وبحرية. يذكر النص البيليست وتشكر وشيكلش ودنيين ووشش، وتظهر تسمية للشردان في تعليق على أحد الأسرى.'],
          en: ['Year 8 Reliefs', 'The Year 8 texts and scenes record a coalition of northern groups and depict land and naval engagements. The inscription names Peleset, Tjeker, Shekelesh, Denyen, and Weshesh; a caption identifies a captive as Sherden.']
        }
      };

      function makeMat(color, roughness) {
        return new THREE.MeshStandardMaterial({ color: color, roughness: roughness === undefined ? 0.9 : roughness });
      }
      function tag(object, id) {
        object.userData.infoId = id;
        object.userData.selectable = true;
        clickable.push(object);
        return object;
      }
      function box(parent, name, x, y, z, sx, sy, sz, material, id, bevel) {
        const geometry = new THREE.BoxGeometry(sx, sy, sz);
        const mesh = new THREE.Mesh(geometry, material || mats.sandstone);
        mesh.name = name;
        mesh.position.set(x, y, z);
        if (id) tag(mesh, id);
        parent.add(mesh);
        return mesh;
      }
      function cylinder(parent, name, x, y, z, rt, rb, h, material, id, sides) {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides || 16), material || mats.sandstoneLight);
        mesh.name = name;
        mesh.position.set(x, y, z);
        if (id) tag(mesh, id);
        parent.add(mesh);
        return mesh;
      }
      function column(parent, x, z, kind, id) {
        const g = new THREE.Group();
        g.position.set(x, 0, z);
        const isOsiride = kind === 'osiride';
        const shaftMat = isOsiride ? mats.sandstoneDark : mats.sandstoneLight;
        cylinder(g, 'Column base', 0, 0.22, 0, 0.62, 0.72, 0.42, mats.sandstoneDark, id);
        cylinder(g, 'Column shaft', 0, 1.74, 0, 0.46, 0.54, 2.65, shaftMat, id);
        cylinder(g, 'Column capital', 0, 3.18, 0, 0.82, 0.53, 0.48, mats.gold, id);
        if (!isOsiride) {
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.72, 6), mats.sandstoneLight);
            petal.position.set(Math.cos(a) * 0.43, 3.53, Math.sin(a) * 0.43);
            petal.rotation.z = Math.cos(a) * 0.35;
            petal.rotation.x = Math.sin(a) * 0.35;
            g.add(petal);
          }
        } else {
          // A deliberately schematic Osiride statue silhouette, not a portrait.
          box(g, 'Osiride shoulder block', 0, 3.78, 0, 0.72, 0.48, 0.55, mats.sandstoneDark, id);
          cylinder(g, 'Osiride head', 0, 4.28, 0, 0.27, 0.27, 0.55, mats.sandstoneLight, id, 12);
          box(g, 'Osiride beard', 0, 3.95, 0.29, 0.13, 0.42, 0.12, mats.gold, id);
        }
        g.traverse(o => { if (o.isMesh && id) tag(o, id); });
        parent.add(g);
        return g;
      }
      function plinth(parent, width, depth) {
        box(parent, 'Stone platform', 0, -0.42, 0, width, 0.8, depth, mats.darkBrick);
        box(parent, 'Platform edge', 0, 0.02, 0, width - 0.3, 0.18, depth - 0.3, mats.sandstoneDark);
      }
      function makeDust() {
        const count = 260;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 64;
          pos[i * 3 + 1] = Math.random() * 17 + 1;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 64;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: 0xd7bd8e, size: 0.055, transparent: true, opacity: 0.35, depthWrite: false });
        dust = new THREE.Points(geo, mat);
        scene.add(dust);
      }
      makeDust();

      function labelObject(parent, text, x, y, z, id) {
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 14), mats.gold);
        marker.position.set(x, y, z);
        if (id) tag(marker, id);
        parent.add(marker);
        return marker;
      }

      function buildComplex() {
        const g = new THREE.Group();
        plinth(g, 41, 32);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 31), makeMat(0x8b7656, 1));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0.08;
        g.add(ground);
        // Outer mud-brick enclosure; the eastern entrance is intentionally left open.
        box(g, 'North enclosure wall', 0, 1.7, -15, 37, 3.4, 1.15, mats.mudbrick, 'wall');
        box(g, 'West enclosure wall', -18, 1.7, 0, 1.15, 3.4, 30, mats.mudbrick, 'wall');
        box(g, 'South enclosure wall', 0, 1.7, 15, 37, 3.4, 1.15, mats.mudbrick, 'wall');
        box(g, 'East enclosure wall north segment', 0, 1.7, 15, 12, 3.4, 1.15, mats.mudbrick, 'wall');
        box(g, 'East enclosure wall south segment', 0, 1.7, 15, 12, 3.4, 1.15, mats.mudbrick, 'wall');
        box(g, 'Gate tower west', -3.25, 3.0, 15, 4.0, 5.8, 2.1, mats.mudbrick, 'gate');
        box(g, 'Gate tower east', 3.25, 3.0, 15, 4.0, 5.8, 2.1, mats.mudbrick, 'gate');
        box(g, 'Gate roof bridge', 0, 5.7, 15, 2.5, 0.5, 2.0, mats.mudbrick, 'gate');
        box(g, 'Gate upper terrace west', -3.25, 6.05, 15, 4.2, 0.28, 2.3, mats.sandstoneDark, 'gate');
        box(g, 'Gate upper terrace east', 3.25, 6.05, 15, 4.2, 0.28, 2.3, mats.sandstoneDark, 'gate');

        // Main temple: east-to-west progression, shown schematically.
        box(g, 'First Pylon left tower', -5.2, 3.15, 9.4, 3.0, 6.0, 1.8, mats.sandstone, 'pylon1');
        box(g, 'First Pylon right tower', 5.2, 3.15, 9.4, 3.0, 6.0, 1.8, mats.sandstone, 'pylon1');
        box(g, 'First Pylon crown left', -5.2, 6.25, 9.4, 3.15, 0.25, 1.95, mats.gold, 'pylon1');
        box(g, 'First Pylon crown right', 5.2, 6.25, 9.4, 3.15, 0.25, 1.95, mats.gold, 'pylon1');
        // First court and colonnade.
        for (let x of [-4.7, -2.5, 2.5, 4.7]) {
          column(g, x, 5.7, 'papyrus', 'court1');
          column(g, x, 2.2, 'papyrus', 'court1');
        }
        box(g, 'Second Pylon left', -5.2, 2.9, 0.3, 2.8, 5.4, 1.55, mats.sandstoneDark, 'pylon2');
        box(g, 'Second Pylon right', 5.2, 2.9, 0.3, 2.8, 5.4, 1.55, mats.sandstoneDark, 'pylon2');
        for (let x of [-4.7, -2.5, 2.5, 4.7]) column(g, x, -2.7, 'osiride', 'court2');
        // Three-column-hall zone.
        box(g, 'Hypostyle Hall outer wall west', -6.1, 2.2, -6.6, 0.75, 4.5, 8.0, mats.sandstoneDark, 'hypostyle');
        box(g, 'Hypostyle Hall outer wall east', 6.1, 2.2, -6.6, 0.75, 4.5, 8.0, mats.sandstoneDark, 'hypostyle');
        for (let z of [-4.0, -6.3, -8.6]) {
          for (let x of [-4.1, -1.4, 1.4, 4.1]) column(g, x, z, 'papyrus', 'hypostyle');
        }
        box(g, 'Chapel block', 0, 1.65, -11.3, 8.8, 3.3, 3.0, mats.sandstone, 'sanctuary');
        box(g, 'Sanctuary inner room', 0, 2.1, -12.0, 4.2, 4.1, 1.6, mats.sandstoneLight, 'sanctuary');

        // Royal palace, magazines, and Small Temple of Amun.
        box(g, 'Palace enclosure', -11.8, 1.15, 3.8, 8.0, 2.3, 7.0, mats.sandstoneDark, 'palace');
        box(g, 'Palace audience hall', -11.8, 2.05, 3.8, 5.0, 2.0, 3.4, mats.sandstone, 'palace');
        box(g, 'Appearance window marker', -11.8, 3.25, 5.7, 1.55, 0.55, 0.22, mats.gold, 'palace');
        for (let x of [9.2, 11.3, 13.4]) box(g, 'Magazine', x, 1.05, 7.3, 1.5, 2.1, 3.2, mats.mudbrick, 'magazines');
        box(g, 'Small Temple of Amun core', 11.4, 1.5, -7.2, 6.0, 3.0, 5.0, mats.sandstone, 'smallTemple');
        box(g, 'Small Temple inner shrine', 11.4, 2.4, -7.2, 2.6, 4.8, 2.2, mats.sandstoneLight, 'smallTemple');
        // Water channel and landing place at the eastern side.
        const canal = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 14), mats.water);
        canal.position.set(15.5, 0.18, 1.5);
        canal.userData.infoId = 'gate'; canal.userData.selectable = true; clickable.push(canal); g.add(canal);
        labelObject(g, 'Gate marker', 0, 7.0, 15, 'gate');
        world.add(g);
      }

      function buildGate() {
        const g = new THREE.Group();
        plinth(g, 26, 19);
        const base = new THREE.Mesh(new THREE.PlaneGeometry(26, 19), makeMat(0x806b50, 1));
        base.rotation.x = -Math.PI / 2; base.position.y = 0.08; g.add(base);
        // Mudbrick migdol-like gate: intentionally explanatory massing model.
        for (let side of [-1, 1]) {
          const x = side * 5.0;
          box(g, 'Gate tower core', x, 3.0, 0, 6.0, 6.0, 5.0, mats.mudbrick, 'gate');
          box(g, 'Gate tower upper terrace', x, 6.15, 0, 6.3, 0.3, 5.35, mats.sandstoneDark, 'gate');
          box(g, 'Upper room', x, 7.05, -0.3, 4.8, 1.4, 3.0, mats.mudbrick, 'gate');
          for (let j = -2; j <= 2; j++) {
            box(g, 'Terrace crenellation', x + j * 1.0, 6.65, 2.15, 0.38, 0.65, 0.45, mats.sandstone, 'gate');
          }
        }
        box(g, 'Lintel', 0, 5.1, 0, 4.0, 0.6, 5.2, mats.sandstone, 'gate');
        box(g, 'Door threshold', 0, 0.16, 0, 4.3, 0.25, 5.2, mats.gold, 'gate');
        // Passage side walls and guard chambers.
        box(g, 'Passage wall left', -2.1, 2.3, -0.4, 0.32, 4.6, 5.8, mats.sandstoneDark, 'gate');
        box(g, 'Passage wall right', 2.1, 2.3, -0.4, 0.32, 4.6, 5.8, mats.sandstoneDark, 'gate');
        box(g, 'Guard chamber left', -5.0, 1.4, -4.0, 3.5, 2.8, 2.7, mats.darkBrick, 'gate');
        box(g, 'Guard chamber right', 5.0, 1.4, -4.0, 3.5, 2.8, 2.7, mats.darkBrick, 'gate');
        // Decorative vertical inlays, not reconstructed hieroglyphs.
        for (let side of [-1, 1]) {
          for (let y = 1.2; y < 5.2; y += 1.15) {
            box(g, 'Decorative panel', side * 5, y, 2.56, 2.4, 0.55, 0.08, mats.gold, 'relief');
          }
        }
        world.add(g);
      }

      function buildHall() {
        const g = new THREE.Group();
        plinth(g, 29, 24);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(29, 24), makeMat(0x927b59, 1));
        floor.rotation.x = -Math.PI / 2; floor.position.y = 0.08; g.add(floor);
        // Roof beams and stylized papyrus columns.
        for (let x = -9; x <= 9; x += 4.5) {
          for (let z = -7.5; z <= 7.5; z += 5) {
            column(g, x, z, (x === -9 || x === 9) && z === 7.5 ? 'osiride' : 'papyrus', (x === -9 || x === 9) && z === 7.5 ? 'osiride' : 'column');
          }
        }
        box(g, 'Architrave beam', 0, 4.25, -7.5, 21, 0.7, 0.9, mats.sandstoneDark, 'hypostyle');
        box(g, 'Architrave beam', 0, 4.25, -2.5, 21, 0.7, 0.9, mats.sandstoneDark, 'hypostyle');
        box(g, 'Architrave beam', 0, 4.25, 2.5, 21, 0.7, 0.9, mats.sandstoneDark, 'hypostyle');
        box(g, 'Architrave beam', 0, 4.25, 7.5, 21, 0.7, 0.9, mats.sandstoneDark, 'hypostyle');
        world.add(g);
      }

      function buildRelief() {
        const g = new THREE.Group();
        plinth(g, 28, 15);
        box(g, 'Relief background wall', 0, 4.0, -3.3, 22, 8.0, 0.9, mats.sandstoneDark, 'relief');
        // Framed panel field.
        box(g, 'Relief panel', 0, 4.0, -2.78, 18.5, 6.2, 0.16, mats.sandstone, 'relief');
        for (let x of [-8.7, 0, 8.7]) box(g, 'Vertical framing band', x, 4.0, -2.65, 0.22, 6.2, 0.15, mats.gold, 'relief');
        box(g, 'Horizontal upper band', 0, 6.9, -2.65, 18.5, 0.25, 0.15, mats.gold, 'relief');
        box(g, 'Horizontal lower band', 0, 1.1, -2.65, 18.5, 0.25, 0.15, mats.gold, 'relief');

        // Schematic royal figure at left: intentionally symbolic, not a facsimile of an actual scene.
        box(g, 'King torso', -5.2, 3.9, -2.35, 1.15, 2.25, 0.36, mats.reliefHi, 'king');
        cylinder(g, 'King head', -5.2, 5.35, -2.35, 0.43, 0.43, 0.85, mats.reliefHi, 'king', 12);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 8), mats.gold);
        crown.position.set(-5.2, 6.45, -2.35); tag(crown, 'king'); g.add(crown);
        box(g, 'King front leg', -4.85, 2.6, -2.35, 0.36, 1.2, 0.32, mats.reliefHi, 'king');
        box(g, 'King rear leg', -5.58, 2.55, -2.35, 0.36, 1.25, 0.32, mats.reliefHi, 'king');
        const arm = box(g, 'Raised arm', -4.38, 4.65, -2.25, 0.3, 1.55, 0.3, mats.reliefHi, 'king');
        arm.rotation.z = -0.65;
        const mace = cylinder(g, 'Schematic mace', -3.8, 5.55, -2.15, 0.14, 0.14, 1.0, mats.gold, 'king', 8);
        mace.rotation.z = -0.4;

        // Kneeling captive to the right, stylized geometry.
        box(g, 'Captive torso', 1.7, 3.45, -2.3, 0.86, 1.4, 0.32, mats.reliefHi, 'relief');
        cylinder(g, 'Captive head', 1.7, 4.5, -2.3, 0.35, 0.35, 0.65, mats.reliefHi, 'relief', 12);
        box(g, 'Captive leg', 2.2, 2.55, -2.25, 1.3, 0.32, 0.34, mats.reliefHi, 'relief');
        box(g, 'Captive arm', 1.1, 3.8, -2.2, 0.28, 1.1, 0.28, mats.reliefHi, 'relief');
        // Border rosettes / cartouche-like ornaments: abstract markers only.
        for (let x = -7.5; x <= 7.5; x += 1.5) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 14), mats.gold);
          ring.position.set(x, 6.2, -2.5); tag(ring, 'relief'); g.add(ring);
        }
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), mats.gold);
        marker.position.set(5.3, 4.4, -2.35); tag(marker, 'sea'); g.add(marker);
        world.add(g);
      }

      function cleanWorld() {
        while (world.children.length) {
          const child = world.children.pop();
          world.remove(child);
          child.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material && !Array.isArray(o.material) && !Object.values(mats).includes(o.material)) o.material.dispose();
          });
        }
        clickable.length = 0;
        selectedObject = null;
      }
      function resetCamera(position, target) {
        camera.position.set(position[0], position[1], position[2]);
        controls.target.set(target[0], target[1], target[2]);
        controls.update();
      }
      function setDetail(id) {
        const record = info[id] || info.relief;
        detailTitle.textContent = record[lang()][0];
        detailText.textContent = record[lang()][1];
        if (selectedObject && selectedObject.material && selectedObject.material.emissive) selectedObject.material.emissive.setHex(0x000000);
      }
      function activate(id) {
        if (!id) return;
        setDetail(id);
        const title = (info[id] && info[id][lang()][0]) || '';
        if (status) status.textContent = say('تم اختيار: ', 'Selected: ') + title;
      }
      function setScene(name) {
        currentScene = name;
        cleanWorld();
        if (name === 'complex') {
          buildComplex();
          resetCamera([29, 24, 36], [0, 1, 0]);
          stageLabel.textContent = say('المجمع الكامل · منظور تخطيطي', 'Full precinct · schematic view');
          activate('gate');
        } else if (name === 'gate') {
          buildGate();
          resetCamera([19, 14, 23], [0, 2.5, 0]);
          stageLabel.textContent = say('البوابة العالية · نموذج كتلي توضيحي', 'High Gate · interpretive massing');
          activate('gate');
        } else if (name === 'hall') {
          buildHall();
          resetCamera([22, 16, 25], [0, 1.8, 0]);
          stageLabel.textContent = say('قاعة الأعمدة · ترتيب نباتي وأوزيري', 'Column hall · papyrus and Osiride forms');
          activate('hypostyle');
        } else {
          buildRelief();
          resetCamera([19, 12, 22], [0, 3.6, -1]);
          stageLabel.textContent = say('سطح نقش بارز · تصور رمزي', 'Raised relief surface · symbolic study');
          activate('relief');
        }
        document.querySelectorAll('[data-scene]').forEach(btn => btn.classList.toggle('active', btn.dataset.scene === name));
      }

      function onPointer(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickable, false);
        if (!hits.length) return;
        const object = hits[0].object;
        const id = object.userData.infoId;
        if (!id) return;
        activate(id);
      }
      renderer.domElement.addEventListener('pointerup', onPointer);
      renderer.domElement.addEventListener('pointermove', event => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickable, false);
        renderer.domElement.style.cursor = hits.length ? 'pointer' : 'grab';
      });

      document.querySelectorAll('[data-scene]').forEach(btn => btn.addEventListener('click', () => setScene(btn.dataset.scene)));
      const resetBtn = document.getElementById('resetView');
      if (resetBtn) resetBtn.addEventListener('click', () => setScene(currentScene));
      const autoBtn = document.getElementById('autoRotate');
      if (autoBtn) autoBtn.addEventListener('click', () => {
        controls.autoRotate = !controls.autoRotate;
        autoBtn.classList.toggle('active', controls.autoRotate);
        autoBtn.textContent = controls.autoRotate ? say('إيقاف الدوران', 'Stop rotation') : say('دوران تلقائي', 'Auto rotate');
      });
      const fullBtn = document.getElementById('modelFull');
      if (fullBtn) fullBtn.addEventListener('click', () => {
        const shell = document.getElementById('modelShell');
        if (!document.fullscreenElement) shell.requestFullscreen && shell.requestFullscreen();
        else document.exitFullscreen && document.exitFullscreen();
      });
      window.setHabu3DLanguage = () => {
        const id = detailTitle.dataset.infoId || 'gate';
        setDetail(id);
        if (autoBtn) autoBtn.textContent = controls.autoRotate ? say('إيقاف الدوران', 'Stop rotation') : say('دوران تلقائي', 'Auto rotate');
      };
      const originalActivate = activate;
      activate = function(id) {
        detailTitle.dataset.infoId = id;
        originalActivate(id);
      };
      setScene('complex');

      const resize = () => {
        const width = Math.max(320, mount.clientWidth);
        const height = Math.max(340, mount.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();
      renderer.setAnimationLoop(() => {
        controls.update();
        if (dust) dust.rotation.y += 0.00012;
        renderer.render(scene, camera);
      });
      if (status) status.textContent = say('المشهد جاهز · اختر عنصرًا من المجسم', 'Scene ready · select an element in the model');
    } catch (error) {
      console.error('Three.js initialization failed:', error);
      mount.innerHTML = '<div class="scene-fallback"><div class="fallback-icon">3D</div><h3>' + (document.documentElement.lang === 'en' ? 'The 3D viewer could not load' : 'تعذر تحميل العارض ثلاثي الأبعاد') + '</h3><p>' + (document.documentElement.lang === 'en' ? 'Check your internet connection and reload. The rest of the encyclopedia remains available.' : 'تحقق من اتصال الإنترنت ثم أعد تحميل الصفحة. بقية الموسوعة متاحة حتى عند تعذر تحميل مكتبة Three.js.') + '</p></div>';
      if (status) status.textContent = 'Three.js unavailable';
    }
  })();
}
