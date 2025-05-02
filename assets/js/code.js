products = []
cart = []
infopid = null

function getdesc(product, descfun) {
  if (product[descfun]) {
    return product[descfun]
  }
  return product["ldesc"]
}

function getpic(product) {
  if (product.pic) {
    return product.pic;
  }
  return "assets/images/products/" + product.id + ".png"
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
      if (regex.test(product.name) || regex.test(product.sdesc) || regex.test(product.ldesc)) {
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
    entrytotal = products[pid].price * qty
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
    totalprice += products[pid].price * qty;
  }
  cartDetails.textContent = "$" + totalprice.toLocaleString() + " (" + nitems + ")"
  cartTotal.textContent = "Total: $" + totalprice.toLocaleString();
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

function keypressed(event) {
  if (event.key === "Escape") {
    closemodal();
  }
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
  if (product.starred) {
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
  namediv.textContent = product.name;
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
  const prodprice = document.createTextNode("$" + product.price.toLocaleString());
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
  button.dataset.pid = product.id;
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
  button.dataset.pid = product.id;
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
  products[product.id].cartdiv = pmanagediv;
  products[product.id].cartcarddiv = outerdiv;
  updateProdUI(product.id);
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
  r.style.setProperty('--modaldescwidth', calcdescwidth(product["ldesc"]) + "px");
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
  modalTitle.textContent = product.name;
  modalPrice.textContent = "$" + product.price.toLocaleString();
  modalAdd.dataset.pid = pid;
  modalRemove.dataset.pid = pid;
  modalDescription.textContent = product.ldesc;
  modalImg.src = getpic(product);
  modalStar.style.display = product.starred?"block":"none"; 
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

var product = {
  "id": "p01",
  "name": "Mi producto",
  "pic": "assets/images/ducha.png",
  "sdesc": "Descripción corta.",
  "ldesc": "Una descripción más larga y detallada.",
  "price": 1000
};

var catalog = [
  {
    "name": "Anal",
    "id": "anal",
    "products": [
{"category": "Anal", "id": "SS-SF-70087", "name": "Plug anal metálico con joya small", "ldesc": "Explora nuevas sensaciones con este plug anal de acero inoxidable, diseñado para brindar placer y estilo. Su superficie lisa y su diseño ergonómico facilitan la inserción, mientras que la base decorada con un hermoso cristal añade un toque de elegancia y sensualidad. Perfecto para principiantes y experimentados que buscan intensificar sus experiencias. Compatible con lubricantes a base de agua y silicona. Fácil de limpiar y altamente duradero.", "price": 1000, "starred": true},
{"category": "Anal", "id": "SS-SF-70092", "name": "Plug anal metálico con joya médium", "ldesc": "Explora nuevas sensaciones con este plug anal de acero inoxidable, diseñado para brindar placer y estilo. Su superficie lisa y su diseño ergonómico facilitan la inserción, mientras que la base decorada con un hermoso cristal añade un toque de elegancia y sensualidad. Perfecto para principiantes y experimentados que buscan intensificar sus experiencias. Compatible con lubricantes a base de agua y silicona. Fácil de limpiar y altamente duradero.", "price": 1000},
{"category": "Anal", "id": "0101-2", "name": "Dilatador plug - Iniciador anal", "ldesc": "Descubre nuevas experiencias con este plug anal de silicona, diseñado para brindar comodidad y placer. Su forma delgada y punta cónica facilitan la inserción, haciéndolo ideal tanto para principiantes como para quienes buscan una estimulación suave y placentera. Fabricado en material flexible y seguro para el cuerpo, su base ancha garantiza un uso seguro y cómodo. Compatible con lubricantes a base de agua y fácil de limpiar, este plug es la opción perfecta para quienes desean explorar el placer anal con confianza.", "price": 1000},
{"category": "Anal", "id": "IMA238", "name": "Varita anal", "ldesc": "Descubre el placer progresivo con estas cuentas anales de silicona flexible, diseñadas para brindar una estimulación gradual y placentera. Su estructura en forma de esferas de tamaño creciente permite una inserción cómoda y segura, ideal tanto para principiantes como para usuarios más experimentados. Fabricadas en material suave y seguro para el cuerpo, cuentan con un aro de extracción ergonómico que facilita su uso. Disponibles en colores vibrantes, son compatibles con lubricantes a base de agua y fáciles de limpiar.", "price": 1000}
]
  },
  {
    "name": "Aceites",
    "id": "aceites",
    "products": [
{"category": "Aceites", "id": "CRCT04", "name": "Aceite para Masajes & Lubricante – Desire Coconut Passion x 60ml", "ldesc": "Experimenta una nueva dimensión del placer con Sexitive Desire Coconut Passion 2 en 1, un exquisito aceite para masajes que también funciona como lubricante íntimo. Su fórmula sedosa y de larga duración permite un deslizamiento suave, ideal para masajes sensuales que despiertan los sentidos y elevan la pasión. \nCon un irresistible aroma a coco y vainilla, este aceite hidrata la piel y deja una sensación cálida y placentera. Es compatible con el cuerpo y adecuado para juegos íntimos, proporcionando comodidad y disfrute en cada aplicación. \nCaracterísticas: \n✔ 2 en 1: Aceite para masajes y lubricante íntimo. \n✔ Aroma tropical: Coco y vainilla para una experiencia envolvente. \n✔ Textura sedosa: Facilita un deslizamiento suave sin sensación pegajosa. \n✔ Hidratante: Cuida la piel y la deja suave y tersa. \n✔ Fácil de usar: Presentación con dosificador para mayor comodidad. \nPerfecto para parejas que desean intensificar la intimidad con un toque de sensualidad y placer.", "price": 1000},
{"category": "Aceites", "id": "CR5047", "name": "Aceite Masajes Calor Ligero Fly Night Body Neutro Oil 100 ml", "ldesc": "Descubre una experiencia de lubricación única con Sexual Jade Fancy, un gel lubricante íntimo enriquecido con vitamina C y colágeno, diseñado para brindar una sensación suave y placentera mientras cuida tu piel. Su innovadora fórmula a base de agua proporciona un deslizamiento natural y de larga duración, ideal para intensificar el placer en tus encuentros íntimos. \nBeneficios y características: \n✔ Enriquecido con vitamina C y colágeno: Ayuda a mantener la piel hidratada y rejuvenecida. \n✔ A base de agua: Compatible con preservativos y juguetes sexuales. \n✔ Textura sedosa y ligera: No deja sensación pegajosa ni residuos. \n✔ Fácil de limpiar: Se enjuaga fácilmente con agua, sin dejar manchas. \n✔ Aroma y color inspirados en el jade: Para una experiencia sensual y sofisticada. \nPerfecto para quienes buscan un lubricante de alta calidad que combine placer y cuidado de la piel. Sexual Jade Fancy es la opción ideal para potenciar la intimidad con un toque de frescura y suavidad.", "price": 1000},
    ]
  },
  {
    "name": "Geles",
    "id": "geles",
    "products": [
{"category": "Gel anal", "id": "CRLUB01", "name": "Gel Intimo Anal Efecto Relajante Lubricante Lube Sex", "ldesc": "Descubre el placer sin límites con Sexitive Lübe More Play Premium Relaxing, un gel lubricante anal diseñado para brindar máximo confort y deslizamiento en cada experiencia. Su fórmula especial, enriquecida con aceite de jojoba, ofrece una sensación relajante y suave, reduciendo la fricción para una penetración más placentera y sin molestias. \nBeneficios y características: \n✔ Efecto relajante: Suaviza y prepara la zona para una experiencia más cómoda. \n✔ Con aceite de jojoba: Propiedades hidratantes y calmantes para el cuidado de la piel. \n✔ Textura sedosa y de larga duración: Proporciona un deslizamiento óptimo sin sensación pegajosa. \n✔ Compatible con preservativos y juguetes sexuales: Fórmula segura para múltiples usos. \n✔ Fácil de limpiar: Se enjuaga sin dejar residuos ni manchas. \nIdeal para quienes desean explorar el placer anal con mayor seguridad y comodidad. Sexitive Lübe More Play Premium Relaxing es el aliado perfecto para una experiencia más fluida, placentera y sin preocupaciones.", "price": 1000},
{"category": "Gel anal", "id": "CRMULTITRY", "name": "Lubricante Anal Try Miss V Gel Intimo", "ldesc": "Descubre una experiencia de lubricación única con Miss V Try, un gel lubricante íntimo dual diseñado para brindar una sensación suave, placentera y natural. Su exclusiva fórmula de textura ligera y sedosa proporciona un deslizamiento óptimo, mejorando el confort y la intimidad en cada uso. \nCon un delicioso aroma a cappuccino, este lubricante añade un toque sensual a tus momentos más íntimos, estimulando los sentidos y aumentando la excitación. Compatible con preservativos y juguetes sexuales, es ideal para quienes buscan un producto versátil y seguro para el cuerpo. \nBeneficios y características: \n✔ Textura fluida y ligera: Sensación natural sin pegajosidad. \n✔ Aroma a cappuccino: Toque cálido y estimulante para una experiencia más envolvente. \n✔ Compatible con preservativos y juguetes: Fórmula segura para todo tipo de usos. \n✔ Hidratante y confortable: Proporciona suavidad y cuidado a la piel. \n✔ Fácil de limpiar: No deja residuos ni manchas. \nPerfecto para quienes buscan un lubricante de alta calidad con un extra de sensualidad. Miss V Try es la elección ideal para potenciar el placer y disfrutar de momentos inolvidables.", "price": 1000},
{"category": "Gel femenino", "id": "CRGEF", "name": "Lubricante Femenino Electric Feel Sexitive Gel Intimo", "ldesc": "Descubre una nueva dimensión del placer con Sexitive Electric Feel, un gel íntimo estimulante diseñado para intensificar tus sensaciones y elevar la excitación. Su fórmula especial proporciona un efecto vibrante y electrizante en contacto con la piel, despertando cada fibra de tu cuerpo para experiencias más intensas y placenteras. \nBeneficios y características: \n✔ Efecto estimulante: Sensación vibrante y electrizante para mayor excitación. \n✔ Textura sedosa: No pegajosa, ideal para una aplicación suave y placentera. \n✔ Fácil de aplicar: Presentación en gel que se absorbe rápidamente sin dejar residuos. \n✔ Compatible con el cuerpo: Seguro para el uso íntimo y adecuado para cualquier momento especial. \n✔ Envase práctico: Diseño elegante y discreto para llevarlo a donde quieras. \nPerfecto para quienes desean explorar nuevas sensaciones y potenciar su placer. Sexitive Electric Feel es la opción ideal para encender la pasión y disfrutar de una experiencia única y electrizante.", "price": 1000, "starred": true},
{"category": "Gel femenino", "id": "CRTGOLD80", "name": "Gel Lubricante Intimo Sextual 80 Ml Gold", "ldesc": "Descubre el lujo del placer con Sexual Gold Fancy, un gel lubricante íntimo enriquecido con L-arginina, maca y jengibre, ingredientes reconocidos por sus propiedades estimulantes y energizantes. Su exclusiva fórmula ayuda a intensificar la sensibilidad y el flujo sanguíneo, potenciando las sensaciones para una experiencia más placentera y apasionada. \nBeneficios y características: \n✔ Con L-arginina, maca y jengibre: Estimula la circulación y mejora la respuesta sensorial. \n✔ A base de agua: Compatible con preservativos y juguetes sexuales. \n✔ Textura sedosa y duradera: Brinda un deslizamiento óptimo sin sensación pegajosa. \n✔ Fácil de limpiar: No deja residuos ni manchas. \n✔ Sensación cálida y estimulante: Ideal para elevar la excitación y el placer. \nPerfecto para quienes buscan un lubricante de alta calidad con un extra de estimulación natural. Sexual Gold Fancy es el complemento ideal para intensificar cada momento íntimo con un toque de lujo y sensualidad.", "price": 1000},
{"category": "Gel femenino", "id": "CRTJADE80", "name": "Gel Lubricante Intimo Sextual 80 ml", "ldesc": "Descubre el Aceite Jade, una invitación al placer y la exploración sensorial. Diseñado para despertar los sentidos y potenciar la intimidad, este aceite combina ingredientes de alta calidad con una textura sedosa y un aroma envolvente que te transportará a un mundo de deseo y conexión profunda. \nSu fórmula es ideal para masajes eróticos, juegos preliminares o simplemente para disfrutar de un momento de relajación y bienestar. Al deslizarse suavemente sobre la piel, proporciona una sensación cálida y aterciopelada, estimulando cada rincón del cuerpo con su delicada fragancia y su efecto hidratante. \n🌿 Beneficios del Aceite Jade: \n✔ Textura sedosa y no pegajosa para un deslizamiento perfecto. \n✔ Aroma afrodisíaco y envolvente que estimula los sentidos. \n✔ Hidratación profunda para una piel suave y radiante. \n✔ Ideal para masajes y juegos sensuales, elevando la conexión con tu pareja. \nDéjate envolver por la sensualidad del Aceite Jade y transforma cada caricia en un momento inolvidable. Atrévete a explorar el placer con la suavidad y el encanto de un aceite diseñado para el deseo.", "price": 1000},
{"category": "Gel masculino", "id": "CRBIO130", "name": "Gel Lubricante Intimo Estimulante Masculino 125cc FyL", "ldesc": "Descubre una nueva dimensión de sensaciones con el Gel Lubricante Íntimo Estimulante Masculino FyL, diseñado para intensificar el placer y mejorar la experiencia íntima. Su fórmula especializada no solo proporciona una lubricación de larga duración, sino que también incorpora ingredientes que estimulan y aumentan la sensibilidad, potenciando cada contacto. \nCon una textura suave y sedosa, este gel es perfecto para el juego previo, la intimidad en pareja o la autosatisfacción. Su fórmula de rápida absorción y efecto estimulante crea una sensación placentera que despierta los sentidos y mejora el desempeño. \n🔥 Beneficios del Gel Lubricante Íntimo Masculino FyL: \n✔ Efecto estimulante que aumenta la sensibilidad y el placer. \n✔ Lubricación duradera para una experiencia más cómoda y placentera. \n✔ Textura sedosa y ligera, sin sensación pegajosa. \n✔ Fórmula de alta calidad, compatible con preservativos y juguetes íntimos. \nAtrévete a experimentar el placer al máximo con el Gel Lubricante Íntimo Estimulante Masculino FyL y lleva tu intimidad a un nuevo nivel.", "price": 1000},
{"category": "Gel", "id": "CRTNAT30", "name": "Lubricante Sextual 30 ml Neutro", "ldesc": "Descubre el equilibrio perfecto entre suavidad y placer con Sextual Neutro, un lubricante diseñado para brindarte una experiencia íntima más cómoda y natural. Su fórmula de alta calidad proporciona una lubricación duradera y sedosa, sin fragancias ni sabores, ideal para quienes buscan una opción neutra y respetuosa con la piel. \nCompatible con preservativos y juguetes íntimos, Sextual Neutro es perfecto para cualquier tipo de juego, asegurando deslizamientos suaves y sensaciones más placenteras. Su textura ligera y no pegajosa se adapta a tus necesidades, potenciando cada momento sin interrupciones. \n💧 Beneficios de Sextual Neutro: \n✔ Fórmula sin fragancia ni sabor, ideal para pieles sensibles. \n✔ Lubricación prolongada para mayor comodidad y placer. \n✔ Textura ligera y natural, sin sensación pegajosa. \n✔ Compatible con preservativos y juguetes íntimos. \nHaz de cada encuentro una experiencia más fluida y placentera con Sextual Neutro. Siente el placer sin distracciones y disfruta del momento con total confianza.", "price": 1000},
{"category": "Gel", "id": "CRMULTICHICLE", "name": "Lubricante Miss V Chicle Geles Intimos Comestibles Gel", "ldesc": "Descubre el placer envuelto en un dulce aroma con Miss V Chicle, un lubricante íntimo diseñado para brindarte una experiencia sensorial única y deliciosa. Su exquisito aroma a chicle transforma cada encuentro en un juego de seducción, mientras su fórmula sedosa y de larga duración garantiza una lubricación perfecta para mayor comodidad y placer. \nCon una textura ligera y no pegajosa, Miss V Chicle se desliza suavemente sobre la piel, intensificando las sensaciones y proporcionando un deslizamiento placentero. Además, es compatible con preservativos y juguetes íntimos, asegurando una experiencia segura y libre de preocupaciones. \n🍬 Beneficios de Miss V Chicle: \n✔ Aroma irresistible a chicle, ideal para juegos sensuales. \n✔ Lubricación prolongada para un placer sin interrupciones. \n✔ Textura ligera y sedosa, sin sensación pegajosa. \n✔ Compatible con preservativos y juguetes íntimos. \nDale un toque de dulzura y diversión a tu intimidad con Miss V Chicle.", "price": 1000},
{"category": "Gel", "id": "CRMULTIDL", "name": "Lubricante Miss V Chicle Geles Intimos Comestibles Gel", "ldesc": "Déjate tentar por el irresistible sabor y aroma de Miss V Dulce de Leche, un lubricante íntimo diseñado para transformar cada encuentro en una experiencia deliciosa y placentera. Su exquisito aroma y sutil dulzura despiertan los sentidos, mientras su fórmula de textura sedosa y lubricación prolongada garantiza un deslizamiento suave y natural. \nPerfecto para juegos previos, masajes eróticos o para añadir un toque de diversión y sensualidad a la intimidad, Miss V Dulce de Leche es compatible con preservativos y juguetes íntimos, asegurando un disfrute seguro y sin preocupaciones. \n🍯 Beneficios de Miss V Dulce de Leche: \n✔ Delicioso aroma y sabor a dulce de leche, ideal para explorar nuevas sensaciones. \n✔ Lubricación prolongada para una experiencia más placentera. \n✔ Textura ligera y sedosa, sin sensación pegajosa. \n✔ Compatible con preservativos y juguetes íntimos. \nDisfruta de la combinación perfecta entre placer y dulzura con Miss V Dulce de Leche.", "price": 1000},
    ]
  },
  {
    "name": "Estimuladores",
    "id": "estimuladores",
    "products": [
{"category": "Estimuladores", "id": "SS-PL-010015M", "name": "Huevo Bala Vibrador Regulable A Control Remoto Baile + Pilas", "ldesc": "Pequeño en tamaño, pero grande en intensidad, el Estimulador Bala Simple es el complemento perfecto para quienes buscan sensaciones vibrantes en cualquier momento y lugar. Su diseño discreto y elegante lo convierte en un juguete ideal para estimular zonas erógenas con precisión, ya sea en solitario o en pareja. \nCon una vibración potente pero silenciosa, este estimulador ofrece una experiencia placentera y discreta. Su tamaño compacto permite llevarlo contigo a donde quieras, asegurando momentos de placer instantáneo con solo presionar un botón. \n🔥 Beneficios del Estimulador Bala Simple: \n✔ Diseño compacto y discreto, ideal para llevar a cualquier parte. \n✔ Vibración potente para una estimulación intensa y placentera. \n✔ Fácil de usar, con un solo botón de control. \n✔ Superficie suave y cómoda al tacto. \n✔ Ideal para el juego en solitario o en pareja. \nDescubre el placer en su forma más práctica y versátil con el Estimulador Bala Simple. ¡Déjate llevar por sus vibraciones y disfruta del momento al máximo!", "price": 1000},
{"category": "Vibradores rígidos", "id": "SS-SF-71065", "name": "Vibrador Consolador Bala Estimulador Clitoris Femenino", "ldesc": "Explora nuevas sensaciones con el Vibrador Estimulador de Clítoris, diseñado para brindar orgasmos intensos y una estimulación precisa. Con un diseño ergonómico y tecnología de vibración potente, este juguete íntimo se adapta perfectamente a tu cuerpo para maximizar el placer en cada uso. \nSu textura suave y sedosa proporciona una experiencia placentera al contacto con la piel, mientras que sus diferentes modos de vibración te permiten personalizar la intensidad según tu deseo. Ideal para el juego en solitario o como complemento en pareja, este vibrador es el aliado perfecto para disfrutar de momentos de intimidad únicos. \n💜 Beneficios del Vibrador Estimulador de Clítoris: \n✔ Vibraciones potentes y variadas para estimulación personalizada. \n✔ Diseño ergonómico y fácil de usar, ideal para la comodidad femenina. \n✔ Superficie suave y segura para la piel. \n✔ Tamaño compacto y discreto, perfecto para llevar a cualquier lugar. \n✔ Recargable e impermeable, para disfrutar sin límites. \nDescubre el placer a otro nivel con el Vibrador Estimulador de Clítoris y déjate llevar por sus intensas vibraciones.", "price": 1000},
    ]
  }
];





function createnavbarentry(category) {
  const linkText = document.createTextNode(category.name);
  const newa = document.createElement("a");
  newa.href = "#" + category.id;
  newa.appendChild(linkText);
  const newli = document.createElement("li");
  newli.appendChild(newa);
  document.getElementById("navcontainer").appendChild(newli);
  document.getElementById("navsmall").appendChild(newli.cloneNode(true));
}

function createcategorydiv(category) {
  const newdiv = document.createElement("div");
  newdiv.classList.add("categorydiv")
  newdiv.id = category.id
  const newhr = document.createElement("hr");
  newdiv.appendChild(newhr);
  const linkText = document.createTextNode(category.name);
  newdiv.appendChild(linkText);
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
  newdiv.dataset.pid = product.id;
  classes = {
    "detailsdiv": "detailsdiv",
    "proddescription": "proddescription",
    "prodname": "prodname",
    "star": "star",
  }
  createprodimg(product, newdiv, classes);
  pmanagediv = createdetails(product, newdiv, "sdesc", classes);
  div.appendChild(newdiv);
  products[product.id].pmanagedivs.push(pmanagediv);
}

var starredproducts = [];
function createbodyentry(category) {
  var newdiv = createcategorydiv(category);
  for (var product of category.products) {
    products[product.id] = product;
    products[product.id].pmanagedivs = [];
    if (product.starred) {
      starredproducts.push(product.id);
    }
    createproductdiv(product, newdiv);
  }
}
for (var category of catalog) {
  createnavbarentry(category);
  createbodyentry(category);
}
const destacadosdiv = document.getElementById("destacadosinner");
for (var pid of starredproducts) {
  createproductdiv(products[pid], destacadosdiv);
}

const ass = [
  [...document.querySelectorAll("#navcontainer a")],
  [...document.querySelectorAll("#navsmall a")]
];
const navtextdiv = document.getElementById("navtextinner")
function scrollhandler() {
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

// Menu elevator animation
document.querySelectorAll('.main-nav a[href*="#"]:not([href="#"])')
  .forEach(link => {
    link.addEventListener('click', gotosection);
  });
