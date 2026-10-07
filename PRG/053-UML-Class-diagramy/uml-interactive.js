/**
 * ==========================================================================
 * PRG 053: UML Class diagramy – Interaktivní trenažér a inspektor vztahů
 * Zavedené světové konvence: PascalCase pro třídy/typy, camelCase/snake_case
 * pro metody a atributy v angličtině, české výukové vysvětlení.
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Databáze vztahů pro interaktivní trenažér na Snímku 9
  const RELATIONSHIPS = {
    inheritance: {
      id: 'inheritance',
      name: 'Generalizace (Dědičnost)',
      concept: 'IS-A („je druhem")',
      symbolDesc: 'Plná čára s velkým nevyplněným trojúhelníkem směřujícím k předkovi',
      whoIsWho: 'Potomek (Dog) ➔ Předek / Rodič (Animal)',
      lifecycleText: 'Typový vztah na úrovni tříd. Třída Dog přebírá strukturu a chování předka Animal.',
      canSurvive: 'Není aplikovatelné na zánik instance (potomek je sám instancí své třídy s bází předka).',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <!-- Class A (Předek - Animal) -->
          <g transform="translate(320, 25)">
            <rect width="170" height="130" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <rect width="170" height="34" rx="6" fill="rgba(56, 189, 248, 0.15)"/>
            <text x="85" y="22" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="bold" font-family="monospace">Animal</text>
            <line x1="0" y1="34" x2="170" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">+ name: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace"># age: Integer</text>
            <line x1="0" y1="84" x2="170" y2="84" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="104" fill="#94a3b8" font-size="11" font-family="monospace">+ makeSound(): void</text>
            <text x="12" y="122" fill="#94a3b8" font-size="11" font-family="monospace">+ sleep(): void</text>
          </g>

          <!-- Class B (Potomek - Dog) -->
          <g id="simChildNode" transform="translate(30, 45)">
            <rect width="170" height="90" rx="6" fill="#1e293b" stroke="#60a5fa" stroke-width="2"/>
            <rect width="170" height="34" rx="6" fill="rgba(96, 165, 250, 0.15)"/>
            <text x="85" y="22" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="bold" font-family="monospace">Dog</text>
            <line x1="0" y1="34" x2="170" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">+ breed: String</text>
            <line x1="0" y1="62" x2="170" y2="62" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="80" fill="#94a3b8" font-size="11" font-family="monospace">+ bark(): void</text>
          </g>

          <!-- Spojnice dědičnosti (z Dog do Animal) -->
          <line x1="200" y1="90" x2="300" y2="90" stroke="#f8fafc" stroke-width="2.5"/>
          <!-- Trojúhelník (směřuje k předkovi Animal) -->
          <polygon points="320,90 300,80 300,100" fill="#0f172a" stroke="#f8fafc" stroke-width="2.5"/>
          <text x="250" y="75" text-anchor="middle" fill="#38bdf8" font-size="11" font-family="sans-serif" font-weight="bold">extends</text>
        </svg>
      `,
      code: {
        python: `class Animal:\n    def __init__(self, name: str, age: int):\n        self.name = name\n        self._age = age\n\n    def make_sound(self):\n        pass\n\n# Dog DĚDÍ ze třídy Animal (Generalizace)\nclass Dog(Animal):\n    def __init__(self, name: str, age: int, breed: str):\n        super().__init__(name, age)\n        self.breed = breed\n\n    def bark(self):\n        print("Woof!")`,
        javascript: `class Animal {\n  constructor(name, age) {\n    this.name = name;\n    this._age = age;\n  }\n  makeSound() {}\n}\n\n// Dog DĚDÍ ze třídy Animal (extends)\nclass Dog extends Animal {\n  constructor(name, age, breed) {\n    super(name, age);\n    this.breed = breed;\n  }\n  bark() {\n    console.log("Woof!");\n  }\n}`,
        php: `class Animal {\n    public string $name;\n    protected int $age;\n\n    public function __construct(string $name, int $age) {\n        $this->name = $name;\n        $this->age = $age;\n    }\n}\n\n// Dog DĚDÍ ze třídy Animal (extends)\nclass Dog extends Animal {\n    public string $breed;\n\n    public function __construct(string $name, int $age, string $breed) {\n        parent::__construct($name, $age);\n        $this->breed = $breed;\n    }\n}`
      }
    },

    realization: {
      id: 'realization',
      name: 'Realizace (Implementace rozhraní)',
      concept: 'CAN-DO / CONTRACT („splňuje kontrakt")',
      symbolDesc: 'Čárkovaná čára s velkým nevyplněným trojúhelníkem směřujícím k rozhraní',
      whoIsWho: 'Třída (CardPayment) ➔ Rozhraní (IPayable)',
      lifecycleText: 'Třída se zavazuje implementovat všechny metody předepsané v rozhraní.',
      canSurvive: 'Typový vztah bez instančního vlastnictví.',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <!-- Interface A (IPayable) -->
          <g transform="translate(320, 30)">
            <rect width="170" height="120" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2" stroke-dasharray="6,4"/>
            <rect width="170" height="42" rx="6" fill="rgba(16, 185, 129, 0.15)"/>
            <text x="85" y="18" text-anchor="middle" fill="#6ee7b7" font-size="10" font-family="monospace">&lt;&lt;interface&gt;&gt;</text>
            <text x="85" y="34" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">IPayable</text>
            <line x1="0" y1="42" x2="170" y2="42" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="66" fill="#94a3b8" font-size="11" font-family="monospace">+ pay(amount: Float): Bool</text>
            <text x="12" y="90" fill="#94a3b8" font-size="11" font-family="monospace">+ refund(): Bool</text>
          </g>

          <!-- Class B (CardPayment) -->
          <g id="simChildNode" transform="translate(30, 35)">
            <rect width="175" height="110" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
            <rect width="175" height="34" rx="6" fill="rgba(52, 211, 153, 0.15)"/>
            <text x="87" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">CardPayment</text>
            <line x1="0" y1="34" x2="175" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- cardNumber: String</text>
            <line x1="0" y1="62" x2="175" y2="62" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="82" fill="#94a3b8" font-size="11" font-family="monospace">+ pay(amount: Float): Bool</text>
            <text x="12" y="100" fill="#94a3b8" font-size="11" font-family="monospace">+ refund(): Bool</text>
          </g>

          <!-- Spojnice realizace (čárkovaná + trojúhelník) -->
          <line x1="205" y1="90" x2="300" y2="90" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6,4"/>
          <polygon points="320,90 300,80 300,100" fill="#0f172a" stroke="#10b981" stroke-width="2.5"/>
          <text x="252" y="75" text-anchor="middle" fill="#10b981" font-size="11" font-family="sans-serif" font-weight="bold">implements</text>
        </svg>
      `,
      code: {
        python: `from abc import ABC, abstractmethod\n\nclass IPayable(ABC):\n    @abstractmethod\n    def pay(self, amount: float) -> bool:\n        pass\n\n# CardPayment REALIZUJE rozhraní IPayable\nclass CardPayment(IPayable):\n    def __init__(self, card_number: str):\n        self.__card_number = card_number\n\n    def pay(self, amount: float) -> bool:\n        print(f"Paying {amount} CZK using card {self.__card_number}")\n        return True`,
        javascript: `// TypeScript / JS rozhraní kontraktu\n// interface IPayable { pay(amount: number): boolean; }\n\nclass CardPayment {\n  #cardNumber;\n  constructor(cardNumber) {\n    this.#cardNumber = cardNumber;\n  }\n  // Implementace požadované metody kontraktu\n  pay(amount) {\n    console.log(\`Paying \${amount} CZK with card\`);\n    return true;\n  }\n}`,
        php: `interface IPayable {\n    public function pay(float $amount): bool;\n    public function refund(): bool;\n}\n\n// Třída implementuje formální rozhraní\nclass CardPayment implements IPayable {\n    private string $cardNumber;\n\n    public function pay(float $amount): bool {\n        return true;\n    }\n    public function refund(): bool {\n        return true;\n    }\n}`
      }
    },

    composition: {
      id: 'composition',
      name: 'Kompozice (Silné složení)',
      concept: 'OWNS-A („pevně vlastní součást")',
      symbolDesc: 'Plná čára s VYPLNĚNÝM (černým) kosočtvercem na straně celku',
      whoIsWho: 'Celek (Order) ◆──── Součást (OrderItem)',
      lifecycleText: 'Součást vzniká uvnitř celku a NEMŮŽE bez něj existovat. Při zániku celku je součást zničena!',
      canSurvive: 'NE. Zánik celku automaticky zničí všechny jeho vnitřní části.',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <!-- Class A (Celek - Order) -->
          <g id="simParentNode" transform="translate(20, 30)">
            <rect width="175" height="120" rx="6" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
            <rect width="175" height="34" rx="6" fill="rgba(244, 63, 94, 0.15)"/>
            <text x="87" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Order [Celek]</text>
            <line x1="0" y1="34" x2="175" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- orderNumber: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- items: List&lt;OrderItem&gt;</text>
            <line x1="0" y1="80" x2="175" y2="80" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="100" fill="#94a3b8" font-size="11" font-family="monospace">+ addItem(productName, price)</text>
          </g>

          <!-- Class B (Část - OrderItem) -->
          <g id="simChildNode" transform="translate(325, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#fda4af" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(253, 164, 175, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">OrderItem [Část]</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- productName: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- unitPrice: Float</text>
            <text x="12" y="88" fill="#94a3b8" font-size="11" font-family="monospace">+ calculateTotal(): Float</text>
          </g>

          <!-- Spojnice s plným kosočtvercem u celku -->
          <polygon points="195,90 210,81 225,90 210,99" fill="#f43f5e" stroke="#f43f5e" stroke-width="2"/>
          <line x1="225" y1="90" x2="325" y2="90" stroke="#f43f5e" stroke-width="2.5"/>
          <text x="210" y="74" fill="#f43f5e" font-size="12" font-family="monospace" font-weight="bold">1</text>
          <text x="310" y="78" fill="#fda4af" font-size="12" font-family="monospace" font-weight="bold">1..*</text>
        </svg>
      `,
      code: {
        python: `class OrderItem:\n    def __init__(self, product_name: str, unit_price: float):\n        self.product_name = product_name\n        self.unit_price = unit_price\n\nclass Order:\n    def __init__(self, order_number: str):\n        self.order_number = order_number\n        # KOMPOZICE: Order vytváří své položky interně ve své správě\n        self.items = []\n\n    def add_item(self, product_name: str, unit_price: float):\n        item = OrderItem(product_name, unit_price) # Vzniká uvnitř objednávky\n        self.items.append(item)\n\n# Když smažeme objednávku, zaniknou i všechny její položky!\norder = Order("ORD-2026-001")\norder.add_item("Mechanical Keyboard", 1500.0)\ndel order  # Položky zanikají s objektem celku`,
        javascript: `class OrderItem {\n  constructor(productName, unitPrice) {\n    this.productName = productName;\n    this.unitPrice = unitPrice;\n  }\n}\n\nclass Order {\n  constructor(orderNumber) {\n    this.orderNumber = orderNumber;\n    this.items = []; // Pevné vlastnictví\n  }\n  addItem(productName, unitPrice) {\n    // Kompozice: instance OrderItem vzniká uvnitř objednávky\n    this.items.push(new OrderItem(productName, unitPrice));\n  }\n}`,
        php: `class OrderItem {\n    public function __construct(public string $productName, public float $unitPrice) {}\n}\n\nclass Order {\n    private array $items = [];\n\n    public function addItem(string $productName, float $unitPrice): void {\n        // Kompozice: Položka vzniká přímo uvnitř objednávky\n        $this->items[] = new OrderItem($productName, $unitPrice);\n    }\n}`
      }
    },

    aggregation: {
      id: 'aggregation',
      name: 'Agregace (Volné složení)',
      concept: 'HAS-A („sdružuje nezávislé objekty")',
      symbolDesc: 'Plná čára s PRÁZDNÝM (nevyplněným) kosočtvercem na straně celku',
      whoIsWho: 'Celek (Department) ◇──── Součást (Teacher)',
      lifecycleText: 'Objekty jsou předány zvenčí (např. přes konstruktor). Pokud celek zanikne, učitel existuje dál!',
      canSurvive: 'ANO! Části mají vlastní nezávislý životní cyklus.',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <!-- Class A (Celek - Department) -->
          <g id="simParentNode" transform="translate(20, 30)">
            <rect width="175" height="120" rx="6" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
            <rect width="175" height="34" rx="6" fill="rgba(251, 191, 36, 0.15)"/>
            <text x="87" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Department [Celek]</text>
            <line x1="0" y1="34" x2="175" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- name: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- teachers: List&lt;Teacher&gt;</text>
            <line x1="0" y1="80" x2="175" y2="80" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="100" fill="#94a3b8" font-size="11" font-family="monospace">+ addTeacher(t: Teacher)</text>
          </g>

          <!-- Class B (Část - Teacher) -->
          <g id="simChildNode" transform="translate(325, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#fef08a" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(254, 240, 138, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Teacher [Část]</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- fullName: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- title: String</text>
            <text x="12" y="88" fill="#94a3b8" font-size="11" font-family="monospace">+ teach(): void</text>
          </g>

          <!-- Spojnice s prázdným kosočtvercem u celku -->
          <polygon points="195,90 210,81 225,90 210,99" fill="#0f172a" stroke="#fbbf24" stroke-width="2"/>
          <line x1="225" y1="90" x2="325" y2="90" stroke="#fbbf24" stroke-width="2.5"/>
          <text x="210" y="74" fill="#fbbf24" font-size="12" font-family="monospace" font-weight="bold">1</text>
          <text x="310" y="78" fill="#fef08a" font-size="12" font-family="monospace" font-weight="bold">*</text>
        </svg>
      `,
      code: {
        python: `class Teacher:\n    def __init__(self, full_name: str):\n        self.full_name = full_name\n\nclass Department:\n    def __init__(self, name: str):\n        self.name = name\n        self.teachers = []\n\n    # AGREGACE: Teacher je vytvořen nezávisle zvenčí a předán referencí\n    def add_teacher(self, teacher: Teacher):\n        self.teachers.append(teacher)\n\n# Životní cyklus:\nt1 = Teacher("Ing. Jan Novák") # Učitel existuje samostatně\ndept = Department("Katedra informatiky")\ndept.add_teacher(t1)\n\ndel dept # Katedra zanikne, ale t1 v paměti existuje dál!`,
        javascript: `class Teacher {\n  constructor(fullName) {\n    this.fullName = fullName;\n  }\n}\n\nclass Department {\n  constructor(name) {\n    this.name = name;\n    this.teachers = [];\n  }\n  // Agregace: předání existujícího učitele referencí\n  addTeacher(teacher) {\n    this.teachers.push(teacher);\n  }\n}`,
        php: `class Teacher {\n    public function __construct(public string $fullName) {}\n}\n\nclass Department {\n    private array $teachers = [];\n\n    // Agregace přes referenci v metodě či konstruktoru\n    public function addTeacher(Teacher $teacher): void {\n        $this->teachers[] = $teacher;\n    }\n}`
      }
    },

    association: {
      id: 'association',
      name: 'Asociace (Spolupráce & Směrování)',
      concept: 'KNOWS-A („zná jiný objekt")',
      symbolDesc: 'Plná čára, volitelně s jednoduchou otevřenou šipkou určující směr navigace',
      whoIsWho: 'Order ────> Customer (nebo obousměrná)',
      lifecycleText: 'Jeden objekt uchovává referenci na druhý objekt za účelem volání jeho metod.',
      canSurvive: 'ANO. Plně nezávislé objekty.',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <g transform="translate(30, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(168, 85, 247, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Order</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- orderNumber: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- customer: Customer</text>
            <text x="12" y="88" fill="#94a3b8" font-size="11" font-family="monospace">+ sendInvoice(): void</text>
          </g>

          <g transform="translate(325, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#c084fc" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(192, 132, 252, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Customer</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- name: String</text>
            <text x="12" y="70" fill="#94a3b8" font-size="11" font-family="monospace">- email: String</text>
            <text x="12" y="88" fill="#94a3b8" font-size="11" font-family="monospace">+ getEmail(): String</text>
          </g>

          <!-- Spojnice asociace se šipkou směrovatelnosti -->
          <line x1="195" y1="90" x2="315" y2="90" stroke="#a855f7" stroke-width="2.5"/>
          <polyline points="305,80 325,90 305,100" fill="none" stroke="#a855f7" stroke-width="2.5"/>
          <text x="210" y="76" fill="#a855f7" font-size="12" font-family="monospace" font-weight="bold">*</text>
          <text x="305" y="76" fill="#c084fc" font-size="12" font-family="monospace" font-weight="bold">1</text>
        </svg>
      `,
      code: {
        python: `class Customer:\n    def __init__(self, name: str, email: str):\n        self.name = name\n        self.email = email\n\nclass Order:\n    # ASOCIACE: Order odkazuje na instanci Customer přes atribut\n    def __init__(self, order_number: str, customer: Customer):\n        self.order_number = order_number\n        self.customer = customer\n\n    def send_invoice(self):\n        print(f"Sending invoice to {self.customer.email}")`,
        javascript: `class Order {\n  // Reference na existujícího zákazníka\n  constructor(orderNumber, customer) {\n    this.orderNumber = orderNumber;\n    this.customer = customer;\n  }\n  sendInvoice() {\n    return this.customer.email;\n  }\n}`,
        php: `class Order {\n    // Asociace: typovaný atribut odkazující na instanci Customer\n    public function __construct(\n        public string $orderNumber,\n        public Customer $customer\n    ) {}\n}`
      }
    },

    dependency: {
      id: 'dependency',
      name: 'Závislost (Dependency)',
      concept: 'USES-A („využívá dočasně")',
      symbolDesc: 'Čárkovaná čára s jednoduchou otevřenou šipkou',
      whoIsWho: 'Order - - - > EmailService',
      lifecycleText: 'Nejslabší vazba. Objekt nevlastní instanci jako trvalý atribut, ale přijme ji pouze jako parametr metody nebo lokální proměnnou.',
      canSurvive: 'ANO. Žádný trvalý stav ani vazba.',
      svg: `
        <svg viewBox="0 0 520 180" width="100%" height="160">
          <g transform="translate(30, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(6, 182, 212, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">Order</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="52" fill="#94a3b8" font-size="11" font-family="monospace">- orderNumber: String</text>
            <line x1="0" y1="62" x2="165" y2="62" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="84" fill="#94a3b8" font-size="11" font-family="monospace">+ confirm(svc: EmailService)</text>
          </g>

          <g transform="translate(325, 40)">
            <rect width="165" height="100" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <rect width="165" height="34" rx="6" fill="rgba(56, 189, 248, 0.15)"/>
            <text x="82" y="22" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">EmailService</text>
            <line x1="0" y1="34" x2="165" y2="34" stroke="#334155" stroke-width="1.5"/>
            <text x="12" y="60" fill="#94a3b8" font-size="11" font-family="monospace">+ send(recipient, message)</text>
          </g>

          <!-- Čárkovaná šipka závislosti -->
          <line x1="195" y1="90" x2="315" y2="90" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="6,4"/>
          <polyline points="305,80 325,90 305,100" fill="none" stroke="#06b6d4" stroke-width="2.5"/>
          <text x="255" y="75" text-anchor="middle" fill="#06b6d4" font-size="11" font-family="sans-serif">&lt;&lt;use&gt;&gt;</text>
        </svg>
      `,
      code: {
        python: `class EmailService:\n    def send(self, recipient: str, message: str) -> None:\n        print(f"Sent to {recipient}: {message}")\n\nclass Order:\n    # ZÁVISLOST: EmailService je pouze parametrem metody (není uložena jako trvalý atribut)\n    def confirm(self, email_service: EmailService) -> None:\n        email_service.send("customer@example.com", "Order confirmed successfully")`,
        javascript: `class Order {\n  // Dočasné použití v parametru metody\n  confirm(emailService) {\n    emailService.send('customer@example.com', 'Order confirmed');\n  }\n}`,
        php: `class Order {\n    // Dependency Injection přes parametr metody\n    public function confirm(EmailService $service): void {\n        $service->send('customer@example.com', 'Order confirmed');\n    }\n}`
      }
    }
  };

  /**
   * Inicializace interaktivního simulátoru vztahů na Snímku 9
   */
  function initPlayground() {
    const buttons = document.querySelectorAll('.uml-rel-btn');
    const stageBox = document.getElementById('umlSimStage');
    const conceptTag = document.getElementById('umlSimConcept');
    const symbolDesc = document.getElementById('umlSimSymbol');
    const whoText = document.getElementById('umlSimWho');
    const lifecycleText = document.getElementById('umlSimLifecycle');
    const simDeleteBtn = document.getElementById('umlSimDeleteBtn');
    const deleteResult = document.getElementById('umlSimDeleteResult');

    if (!buttons.length || !stageBox) return;

    let currentRelKey = 'composition';

    function setRelationship(relKey) {
      currentRelKey = relKey;
      const data = RELATIONSHIPS[relKey];
      if (!data) return;

      // Update buttons
      buttons.forEach(btn => {
        if (btn.getAttribute('data-rel') === relKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Update diagram SVG
      stageBox.innerHTML = data.svg;

      // Update descriptions
      if (conceptTag) conceptTag.textContent = data.concept;
      if (symbolDesc) symbolDesc.textContent = data.symbolDesc;
      if (whoText) whoText.textContent = data.whoIsWho;
      if (lifecycleText) lifecycleText.textContent = data.lifecycleText;

      // Reset simulate deletion button & result
      if (deleteResult) {
        deleteResult.textContent = 'Klikněte pro simulaci zániku celku v paměti';
        deleteResult.style.color = 'var(--text-muted)';
      }

      // Update code blocks
      const codePanes = document.querySelectorAll('#umlPlaygroundCode .code-tab-pane');
      codePanes.forEach(pane => {
        const lang = pane.getAttribute('data-lang');
        if (data.code && data.code[lang]) {
          pane.innerHTML = escapeHtml(data.code[lang]);
        }
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-rel');
        setRelationship(key);
      });
    });

    if (simDeleteBtn) {
      simDeleteBtn.addEventListener('click', () => {
        const data = RELATIONSHIPS[currentRelKey];
        const childNode = stageBox.querySelector('#simChildNode');
        const parentNode = stageBox.querySelector('#simParentNode');

        if (currentRelKey === 'composition') {
          if (parentNode) parentNode.style.opacity = '0.3';
          if (childNode) {
            childNode.style.transition = 'all 0.5s ease';
            childNode.style.opacity = '0.15';
            childNode.style.transform = 'translate(325px, 40px) scale(0.9)';
          }
          if (deleteResult) {
            deleteResult.innerHTML = '<strong style="color: #f43f5e;">Zánik:</strong> Celek (Order) zanikl a součást (OrderItem) byla <strong>zničena také</strong>! V paměti nezůstalo nic.';
          }
        } else if (currentRelKey === 'aggregation') {
          if (parentNode) parentNode.style.opacity = '0.3';
          if (childNode) {
            childNode.style.transition = 'all 0.5s ease';
            childNode.style.filter = 'drop-shadow(0 0 10px #fbbf24)';
            childNode.style.opacity = '1';
          }
          if (deleteResult) {
            deleteResult.innerHTML = '<strong style="color: #34d399;">Přežití:</strong> Celek (Department) zanikl, ale součást (Teacher) <strong>v paměti vesele existuje dál</strong>!';
          }
        } else {
          if (deleteResult) {
            deleteResult.innerHTML = `<strong>Výsledek:</strong> ${data.canSurvive}`;
          }
        }
      });
    }

    // Default selection
    setRelationship('composition');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Spuštění po načtení DOMu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayground);
  } else {
    initPlayground();
  }

})();
