products = []
cart = []
infopid = null
var starredproducts = [];
var ass = [];
const navtextdiv = document.getElementById("navtextinner")
var data = null;

function keypressed(event) {
  if (document.readyState != "complete") return;
  if (event.key === "Escape") {
    closemodal();
  }
}

const public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1UefQB5-Vky2pBEZ5rD2Hxs0gI_J_jsZitmfMVwdvHV-B9xg8MLx4G1AHE_WeetfhFnY1htrEk9Fc/pub?output=csv";
Papa.parse(public_spreadsheet_url, {
          download: true,
          header: true,
          complete: function(d) { data=d; }
        });

function getdesc(product, descfun) {
  return product[descfun] || product["Long_desc"];
}

function getpic(product) {
  return product.pic || `assets/images/products/${product.Code}.png`
}

function performSearch() {
  const searchdiv = document.getElementById("searchinner");
  const searchtxt = document.getElementById("searchtxt").value;
  searchdiv.textContent = "";
  if (searchtxt == "") {
    searchdiv.style.display = "none";
    return
  }
  searchdiv.style.display = "block";
  const regex = new RegExp(`\\b${searchtxt}`, 'i');
  const filtered = [];
  for (const [id, product] of Object.entries(products)) {
      if (regex.test(product.Name) || regex.test(product.Short_desc) || regex.test(product.Long_desc)) {
          filtered.push(id);
      }
  }
  for (var pid of filtered) {
    createproductdiv(products[pid], searchdiv);
    updateProdUI(pid);
  }
}

function checkout(event) {
  event.stopPropagation();
  event.preventDefault();
  const cartproducts = Object.entries(cart);
  var nitems = 0;
  var totalprice = 0;
  msg = ""
  for (const [pid, qty] of Object.entries(cart)) {
    product = products[pid]
    entrytotal = products[pid].Price * qty
    msg = msg + `- *${product["name"]} [${pid}]*`
    if (qty>1) {
      msg = msg + ` *(x${qty})*`
    }
    msg = msg + `: $${entrytotal}\n`
    nitems += qty;
    totalprice += entrytotal;
  }
  for (pmanagediv of cart) {
    updatemanagediv(pmanagediv, pid);
  }
  if (nitems == 1) {
    msg = `¡Hola! Quiero pedirte este producto:\n` + msg
  } else {
    msg = `¡Hola! Quiero hacer un pedido con los siguientes productos:\n` + msg
  }
  msg = msg + `*Total de la compra:* $${totalprice}`
  window.open("https://wa.me/5493416944779/?text=" + encodeURI(msg));
}

function updatemanagediv(pmanagediv, pid) {
  const qty = (pid in cart?cart[pid]:0);
  const rmbtn = pmanagediv.querySelector('[data-kind="remove"]');
  const addbtn = pmanagediv.querySelector('[data-kind="add"]');
  const pqtydiv = pmanagediv.querySelector('.pqtydiv');
  rmbtn.style.display = (qty==0?"none":"block");
  addbtn.textContent = (qty==0?"Agregar":"+");
  pqtydiv.style.display = (qty==0?"none":"block");
  pqtydiv.textContent = qty;
}

function updateProdUI(pid) {
  const pmanagedivs = products[pid].pmanagedivs;
  for (pmanagediv of pmanagedivs) {
    updatemanagediv(pmanagediv, pid);
  }
  if (infopid == pid) {
    updatemanagediv(document.getElementById("modal-pmanagediv"), pid);
  }
  var cartdiv = products[pid].cartdiv;
  if(cartdiv) {
    updatemanagediv(cartdiv, pid);
  }
  var cartcarddiv = products[pid].cartcarddiv;
  if (!(pid in cart) && cartcarddiv) {
    cartcarddiv.style.display = "none";
  }
}

function updatecartUI() {
  const cartDetails = document.getElementById("cart-summary");
  const cartTotal = document.getElementById("carttotal");
  const noproductstext = document.getElementById("noproductstext");
  const productsdetail = document.getElementById("productsdetail");
  const cartproducts = Object.entries(cart);
  if (cartproducts.length == 0) {
    noproductstext.style.display = "block";
    productsdetail.style.display = "none";
  } else {
    noproductstext.style.display = "none";
    productsdetail.style.display = "flex";
  }
  var nitems = 0;
  var totalprice = 0;
  for (const [pid, qty] of Object.entries(cart)) {
    nitems += qty;
    totalprice += products[pid].Price * qty;
  }
  cartDetails.textContent = "$" + totalprice.toLocaleString() + " (" + nitems + ")"
  cartTotal.textContent = "Total: $" + totalprice.toLocaleString();
}

function emptycart() {
  oldcart = cart;
  cart = [];
  for (pid in oldcart) {
    updateProdUI(pid);
  }
  updatecartUI();
}

function addhandler(pid) {
  cart[pid] = (pid in cart?cart[pid]:0) + 1;
  updateProdUI(pid);
  updatecartUI();
}

function rmhandler(pid) {
  if (cart[pid] == 1) {
    delete cart[pid];
  } else {
    cart[pid] -= 1;
  }
  updateProdUI(pid);
  updatecartUI();
}

function closemodal() {
  infopid = null;
  document.getElementById("productslist").textContent = "";
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function buildstar(classes) {
  const ribbondiv = document.createElement("div");
  ribbondiv.style.zIndex = 1;
  ribbondiv.style.position = "absolute";
  const stari = document.createElement("i");
  stari.classList.add("fa");
  stari.classList.add("fa-star");
  stari.classList.add("star");
  stari.classList.add(classes["star"]);
  ribbondiv.appendChild(stari);
  return ribbondiv;
}

function createprodimg(product, div, classes) {
  if (product.Starred) {
    div.appendChild(buildstar(classes));
  }
  const prodimg = document.createElement("img");
  prodimg.classList.add("prodimg")
  prodimg.src = getpic(product);
  div.appendChild(prodimg);
}

function createdetails(product, div, descfun, classes) {
  const detailsdiv = document.createElement("div");
  detailsdiv.classList.add(classes["detailsdiv"])

  const namediv = document.createElement("div");
  namediv.classList.add("prodname");
  namediv.classList.add(classes["prodname"]);
  namediv.textContent = product.Name;
  detailsdiv.appendChild(namediv);

  const descdiv = document.createElement("div");
  descdiv.classList.add("proddescription");
  descdiv.classList.add(classes["proddescription"]);
  if (descfun != "") {
    const description = getdesc(product, descfun);
    const proddesc = document.createTextNode(description);
    descdiv.appendChild(proddesc);
    detailsdiv.appendChild(descdiv);
  }

  const pricediv = document.createElement("div");
  pricediv.classList.add("centerinside");
  pricediv.classList.add("prodprice");
  const prodpricediv = document.createElement("div");
  prodpricediv.classList.add("prodpricediv");
  const prodprice = document.createTextNode("$" + product.Price.toLocaleString());
  prodpricediv.appendChild(prodprice);
  pricediv.appendChild(prodpricediv);

  const pmanagediv = document.createElement("div");
  pmanagediv.classList.add("pmanagediv");
  pmanagediv.classList.add("clickable");
  pmanagediv.dataset.kind = "SKIP"
  pricediv.appendChild(pmanagediv);

  var button = document.createElement("a");
  button.href = "#";
  button.classList.add("fgbutton");
  button.classList.add("clickable");
  button.dataset.kind = "remove"
  button.dataset.pid = product.Code;
  button.style.display = "none";
  button.textContent = "-";
  pmanagediv.appendChild(button);

  const pqtydiv = document.createElement("div");
  pqtydiv.classList.add("pqtydiv");
  pqtydiv.textContent = "0";
  pqtydiv.style.display = "none";
  pmanagediv.appendChild(pqtydiv);

  button = document.createElement("a");
  button.href = "#";
  button.classList.add("fgbutton");
  button.classList.add("clickable");
  button.dataset.kind = "add"
  button.dataset.pid = product.Code;
  button.textContent = "Agregar";
  pmanagediv.appendChild(button);

  detailsdiv.appendChild(pricediv);

  div.appendChild(detailsdiv);
  return pmanagediv;
}

function addcartproduct(div, pid, qty) {
  const newdiv = document.createElement("div");
  newdiv.classList.add("cartdetails");
  const imgdiv = document.createElement("div");
  imgdiv.classList.add("cartimgdiv");
  newdiv.appendChild(imgdiv);
  classes = {
    "detailsdiv": "cartdetailsdiv",
    "proddescription": "cartproddescription",
    "prodname": "cartprodname",
    "star": "cartstar",
  }
  createprodimg(product, imgdiv, classes);
  pmanagediv = createdetails(product, newdiv, "", classes);
  const outerdiv = document.createElement("div");
  outerdiv.appendChild(newdiv);
  outerdiv.appendChild(document.createElement("hr"));
  div.appendChild(outerdiv);
  products[product.Code].cartdiv = pmanagediv;
  products[product.Code].cartcarddiv = outerdiv;
  updateProdUI(product.Code);
}

function showmodal() {
  document.getElementById("modal").style.display = "flex"; 
  document.body.style.overflow = "hidden";
}

function showcart(event) {
  event.stopPropagation();
  event.preventDefault();
  showmodal();
  document.getElementById("modal-info").style.display = "none";
  document.getElementById("modal-cart").style.display = "flex";
  const modalTitle = document.getElementById("modal-title");
  modalTitle.textContent = "Carrito";
  const productslist = document.getElementById("productslist");
  for (const [pid, qty] of Object.entries(cart)) {
    product = products[pid];
    addcartproduct(productslist, product, qty);
  }
}

function calcdescwidth(description) {
  return (description.length / 2) | 0;
}

function showinfo(pid) {
  infopid = pid;
  const product = products[pid];
  var r = document.querySelector(':root');
  r.style.setProperty('--modaldescwidth', calcdescwidth(product["Long_desc"]) + "px");
  document.getElementById("modal-info").style.display = "block";
  document.getElementById("modal-cart").style.display = "none";
  showmodal();
  const modalTitle = document.getElementById("modal-title");
  const modalPrice = document.getElementById("modal-price");
  const modalAdd = document.getElementById("modal-add");
  const modalRemove = document.getElementById("modal-remove");
  const modalDescription = document.getElementById("modal-description");
  const modalImg = document.getElementById("modal-img");
  const modalStar = document.getElementById("modal-star");
  modalTitle.textContent = product.Name;
  modalPrice.textContent = "$" + product.Price.toLocaleString();
  modalAdd.dataset.pid = pid;
  modalRemove.dataset.pid = pid;
  modalDescription.textContent = product.Long_desc;
  modalImg.src = getpic(product);
  modalStar.style.display = product.Starred?"block":"none"; 
  updateProdUI(pid);
}

function bodyhandler(event) {
  target = event.target.closest(".clickable");
  if (target == null) {
    return
  }
  event.stopPropagation();
  event.preventDefault();
  var kind = target.dataset.kind;
  var pid = target.dataset.pid;
  switch (kind) {
    case "info":
      return showinfo(pid);
    case "add":
      return addhandler(pid);
    case "remove":
      return rmhandler(pid);
    case "SKIP":
      return
  }
}

function createnavbarentry(category) {
  const linkText = document.createTextNode(category.name);
  const newa = document.createElement("a");
  newa.href = "#" + category.name;
  newa.appendChild(linkText);
  const newli = document.createElement("li");
  newli.appendChild(newa);
  document.getElementById("navcontainer").appendChild(newli);
  document.getElementById("navsmall").appendChild(newli.cloneNode(true));
}

function createcategorydiv(category) {
  const newdiv = document.createElement("div");
  newdiv.classList.add("categorydiv")
  newdiv.id = category.name
  const newhr = document.createElement("hr");
  newdiv.appendChild(newhr);
  const nametext = document.createTextNode(category.name);
  const namediv = document.createElement("div");
  namediv.classList.add("categorytitle")
  namediv.appendChild(nametext);
  newdiv.appendChild(namediv);
  const innerdiv = document.createElement("div");
  innerdiv.classList.add("categoryinnerdiv")
  newdiv.appendChild(innerdiv);
  document.getElementById("categories").appendChild(newdiv);
  return innerdiv;
}

function createproductdiv(product, div) {
  const newdiv = document.createElement("div");
  newdiv.classList.add("info-table")
  newdiv.classList.add("clickable");
  newdiv.dataset.kind = "info"
  newdiv.dataset.pid = product.Code;
  classes = {
    "detailsdiv": "detailsdiv",
    "proddescription": "proddescription",
    "prodname": "prodname",
    "star": "star",
  }
  createprodimg(product, newdiv, classes);
  pmanagediv = createdetails(product, newdiv, "Short_desc", classes);
  div.appendChild(newdiv);
  products[product.Code].pmanagedivs.push(pmanagediv);
}

function createbodyentry(category) {
  var newdiv = createcategorydiv(category);
  for (var product of category.products) {
    products[product.Code] = product;
    products[product.Code].pmanagedivs = [];
    if (product.Starred) {
      starredproducts.push(product.Code);
    }
    createproductdiv(product, newdiv);
  }
}

function scrollhandler() {
  if (document.readyState != "complete") return;
  const scroll = window.scrollY;
  const box = document.getElementById('homesection').offsetHeight;
  const header = document.querySelector('header').offsetHeight;

  // Mostrar u ocultar #headerph y cambiar clase de header
  const headerPh = document.getElementById('headerph');
  const headerEl = document.querySelector('header');

  if (scroll >= box) {
    headerPh.style.display = 'block';
    headerEl.classList.add('background-header');
  } else {
    headerPh.style.display = 'none';
    headerEl.classList.remove('background-header');
  }

  const fromTop = scroll + header + 5;

  for (const as of ass) {
    let winner = null;

    for (let a of as) {
      const href = a.getAttribute('href');
      const scrollitem = document.querySelector(href);

      if (scrollitem.offsetTop < fromTop) {
        if (winner) {
          winner.classList.remove('active');
        }
        winner = a;
      } else {
        a.classList.remove('active');
      }
    }

    navtextdiv.textContent = "";
    if (winner) {
      navtextdiv.textContent = winner.innerText;
      winner.classList.add('active');
    }
  }
}

function menutriggerclick(event) {
  const menutrigger = document.getElementById("menu-trigger")
  menutrigger.classList.toggle('active');


  const navsmall = document.getElementById('navsmall');
  slideToggle(navsmall);
}

function slideUp(element, duration = 200) {
  navtextdiv.style.display = "block";
  element.style.transition = `max-height ${duration}ms ease`;
  element.style.overflow = 'hidden';
  element.style.maxHeight = element.scrollHeight + 'px'; // Establece altura actual

  // Esperar un frame para activar la transición
  requestAnimationFrame(() => {
    element.style.maxHeight = '0';
  });

  // Opcional: ocultar visualmente al terminar
  setTimeout(() => {
    element.style.display = 'none';
  }, duration);
}

function slideDown(element, duration = 200) {
  navtextdiv.style.display = "none";
  element.style.removeProperty('display'); // Quita 'display: none' si estaba
  const display = getComputedStyle(element).display;

  if (display === 'none') {
    element.style.display = 'block';
  }

  element.style.overflow = 'hidden';
  element.style.maxHeight = '0';
  element.style.transition = `max-height ${duration}ms ease`;

  // Esperar un frame para medir y animar
  requestAnimationFrame(() => {
    const fullHeight = element.scrollHeight + 'px';
    element.style.maxHeight = fullHeight;
  });
}

function slideToggle(element, duration = 200) {
  const isCollapsed = getComputedStyle(element).maxHeight === '0px';

  if (isCollapsed) {
    slideDown(element, duration);
  } else {
    slideUp(element, duration);
  }
}

function smoothScrollTo(to, duration) {
  const start = window.pageYOffset;
  const change = to - start;
  const startTime = performance.now();

  function animateScroll(currentTime) {
    const time = Math.min(1, (currentTime - startTime) / duration);
    const easedTime = easeInOutQuad(time);
    window.scrollTo(0, start + change * easedTime);

    if (time < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(animateScroll);
}

function gotosection(event) {
  event.preventDefault(); // Previene el salto directo

  if (
    location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
    location.hostname === this.hostname
  ) {
    let target = document.querySelector(this.hash);
    if (!target) {
      target = document.querySelector(`[name="${this.hash.slice(1)}"]`);
    }

    if (target) {
      document.getElementById('menu-trigger')?.classList.remove('active');
      const navsmall = document.getElementById('navsmall');
      if (navsmall)
        slideUp(navsmall, 200);

      // Desplazamiento suave
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 60;
      smoothScrollTo(targetPosition, 700);
    }
  }
}

function transformAndGroup(products) {
  const grouped = {};

  products.forEach(product => {
    if (!product.Name) {
      return;
    }
    product.Price = parseFloat(
      product.Price.replace(/\$/g, "").replace(/,/g, "")
    );

    product.Starred = product.Starred.toLowerCase() === "true";

    if (!product.Short_desc?.trim()) {
      delete product.Short_desc;
    }

    // Group by Category
    const category = product.Category;
    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(product);
  });

  // Convert to desired format: [{ category, products }]
  const result = Object.entries(grouped).map(([category, products]) => ({
    "name": category,
    "products": products
  }));

  return result;
}

function loadData() {
  newdata = transformAndGroup(data["data"]);
  for (var category of newdata) {
    createnavbarentry(category);
    createbodyentry(category);
  }
  const destacadosdiv = document.getElementById("destacadosinner");
  for (var pid of starredproducts) {
    createproductdiv(products[pid], destacadosdiv);
  }
  ass = [
    [...document.querySelectorAll("#navcontainer a")],
    [...document.querySelectorAll("#navsmall a")]
  ];
  // Menu elevator animation
  document.querySelectorAll('.main-nav a[href*="#"]:not([href="#"])')
    .forEach(link => {
      link.addEventListener('click', gotosection);
    });
  tada();
}

function timeouter() {
  if (data && document.readyState == "complete") {
    loadData();
  } else {
    setTimeout(timeouter, 100);
  }
}

timeouter();
