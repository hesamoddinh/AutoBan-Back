function submitLogin() {
  var param = { username: $("input[name=uname]").val(), password: $("input[name=psw]").val() };
  $.ajax({
    url: "../accounts/authenticate-password",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify(param),
    success: function(response) {
      if (response.success == false) {
        alert(response.msg);
      } else {
        localStorage["jwt-token"] = response.token;
        window.location.replace("categories.html");
      }
    }
  });
}

function checkLogin() {
  if (!localStorage["jwt-token"]) {
    window.location.replace("login.html");
  }
}

function getCategories() {
  checkLogin();
  $.ajax({
    url: "../repairs/list-part-categories",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "GET",
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $.each(response.partCategories, function(index, category) {
        addCategory("categories", category.id, category.persianName);
        // alert(o);
      });
    }
  });
}

function getParts() {
  checkLogin();
  $("#parts").empty();

  var urlParams = new URLSearchParams(window.location.search);
  $("#categoryId").val(urlParams.get("categoryId"));
  $.ajax({
    url: "../repairs/list-parts",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify({ categoryId: urlParams.get("categoryId") }),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $.each(response.parts, function(index, part) {
        addPart("parts", part);
        // alert(o);
      });
    }
  });
}
function openPart(id) {
  window.location.replace("parts.html?categoryId=" + id);
}
function addCategory(contanerId, id, name) {
  var container = $("#" + contanerId);
  var option = $("<div />", { class: "option" });
  $("<label />", { onclick: "openPart(" + id + ")", class: "accordion", id: "category" + id, text: name }).appendTo(
    option
  );
  option.appendTo(container);
}

function replaceNull(data) {
  if (!data) {
    return "---";
  } else return data;
}

function togglePart(id) {
  $("#p" + id).toggle();
}
function addPartToDB() {
  var param = {
    categoryId: $("#categoryId").val(),
    persianName: $("input[name=name]").val(),
    type: $("input[name=type]").val(),
    country: $("input[name=country]").val(),
    manufacturer: $("input[name=manufacturer]").val(),
    lifetimeKM: parseInt($("input[name=lifetimeKM]").val()),
    lifetimeMonths: parseInt($("input[name=lifetimeMonths]").val()),
    SuitableFor: parseInt($("input[name=SuitableFor]").val())
  };
  console.log(param);

  $.ajax({
    url: "../repairs/add-part",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify(param),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $("input[name=name]").val("");
      $("input[name=type]").val("");
      $("input[name=country]").val("");
      $("input[name=manufacturer]").val("");
      $("input[name=lifetimeKM]").val("");
      $("input[name=lifetimeMonths]").val("");
      $("input[name=SuitableFor]").val("");
      $("#addPartModal").hide();
      getParts();
    }
  });
}
function addPart(contanerId, part) {
  var container = $("#" + contanerId);
  var option = $("<div />", { class: "option" });
  $("<button />", { class: "accordion", onclick: "togglePart(" + part.id + ")", text: part.persianName }).appendTo(
    option
  );
  let properties = $("<ul />", { class: "properties", id: "p" + part.id });

  let propery = $("<li />");
  $("<div />", { class: "key", text: "شرکت سازنده" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.manufacturer) }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "کشور سازنده" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.country) }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "نوع" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.type) }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "عمر متوسط (کیلومتر)" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.lifetimeKM) }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "عمر متوسط (ماه)" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.lifetimeMonths) }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "مناسب برای" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.SuitableFor) }).appendTo(propery);
  propery.appendTo(properties);
  properties.hide();
  properties.appendTo(option);
  // $("<label />", { onclick: "openPart(" + id + ")", id: "category" + id, text: name }).appendTo(option);
  option.appendTo(container);
}
