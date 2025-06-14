function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;
	inputText = inputText.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/ /g,"&nbsp;").replace(/\r/g,"")

	// Fix newlines.
	inputText = inputText.replace(/\n/g,"<br>");

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(/&nbsp;/g," ").replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="https://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

	return replacedText;
}
let currserver = "";

function loaded() {setTimeout(init,1000);}
function init() {
let logininfo = {};
let currentuser = {};
let chats = []
let reactionemojis = ["👍","👎","😃","😂","👏","😭","💛","🤔","🎉","🔥", "💀","😘","😐","😡","👌","😆","😱","😋"];
let cachedinfo = {};
let idcallbacks = {};
function getinfo(id, callback) {
	if (cachedinfo.hasOwnProperty(id)) { // Return the cached
		callback(cachedinfo[id]);
	}else {
		if (idcallbacks.hasOwnProperty(id)) {
			idcallbacks[id].push(callback); //Just add this in callback list
		}else { //New request
			idcallbacks[id] = [callback]; //create the array
			fetch(currserver + "getinfo", {body: JSON.stringify({'token': logininfo.token, 'id': id}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						//Yay! now we attempt to parse it then callback all of them
						let info = JSON.parse(text);
						cachedinfo[id] = info;
						idcallbacks[id].forEach((callback) => {
							callback(info);
						})
						delete idcallbacks[id];
					})
				}else { // non 200 response
					uidcallbacks[uid].forEach((callback) => {
						callback({
							name: "Unknown",
							picture: "",
							info: ""
						});
					})
					delete uidcallbacks[uid];
				}
			}).catch(() => { //Error in response
				idcallbacks[id].forEach((callback) => {
					callback({
						name: "Unknown",
						picture: "",
						info: ""
					});
				})
				delete idcallbacks[id];
			});
		}
	}
}

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has("server")) {
	currserver = searchParams.get("server");
}

function openconnectarea(err) {
	document.body.innerHTML = "";
	let connectcnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = "Welcome To Pamukky!"
	connectcnt.appendChild(title);
	let it = document.createElement("label");
	it.innerText = "Enter Server URL To Begin:\n"
	connectcnt.appendChild(it);
	let servertb = document.createElement("input");
	servertb.placeholder = "URL or IP address";
	servertb.style.display = "block";
	servertb.style.width = "100%";
	servertb.style.marginTop = "5px";
	servertb.style.marginBottom = "5px";
	servertb.value = currserver;
	connectcnt.appendChild(servertb);
	let errlbl = document.createElement("label");
	errlbl.classList.add("errorlabel");
	errlbl.innerText = " ";
	connectcnt.appendChild(errlbl);
	let connectbtn = document.createElement("button")
	connectbtn.innerText = "Connect"
	connectbtn.style.width = "100%";
	connectcnt.appendChild(connectbtn);
	document.body.appendChild(connectcnt);
	addRipple(connectbtn,"rgba(255,200,0,0.6)");
	
	if (err) {
		errlbl.innerText = "Connection failed."
	}
	
	connectbtn.addEventListener("click",function() {
		connectbtn.disabled = true;
		errlbl.classList.remove("errorlabel");
		errlbl.classList.add("infolabel");
		errlbl.innerText = "Please Wait...";
		
		fetch(servertb.value + "ping").then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					console.log(text)
					currserver = servertb.value;
					localStorage.setItem("server", servertb.value);
					openloginarea();
				})
			}else {
				connectbtn.disabled = false;
			}
		}).catch(() => {
			connectbtn.disabled = false;
			errlbl.classList.add("errorlabel");
			errlbl.classList.remove("infolabel");
			errlbl.innerText = "Connection failed."
		})
	})
}

function openloginarea() {
	document.body.innerHTML = "";
	let logincnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = "Welcome To Pamukky!"
	logincnt.appendChild(title);
	let it = document.createElement("label");
	it.innerText = "Login To Pamukky:\n"
	logincnt.appendChild(it);
	let emailtb = document.createElement("input");
	emailtb.placeholder = "E-Mail";
	emailtb.style.display = "block";
	emailtb.style.width = "100%";
	emailtb.style.marginTop = "5px";
	emailtb.type = "email";
	emailtb.style.marginBottom = "5px";
	logincnt.appendChild(emailtb);
	let passwordtb = document.createElement("input");
	passwordtb.placeholder = "Password";
	passwordtb.type = "password";
	passwordtb.style.display = "block";
	passwordtb.style.width = "100%";
	passwordtb.style.marginTop = "5px";
	passwordtb.style.marginBottom = "5px";
	logincnt.appendChild(passwordtb);
	let errlbl = document.createElement("label");
	errlbl.classList.add("errorlabel");
	errlbl.innerText = " ";
	logincnt.appendChild(errlbl);
	let loginbtn = document.createElement("button")
	loginbtn.innerText = "Login"
	loginbtn.style.width = "100%";
	logincnt.appendChild(loginbtn);
	document.body.appendChild(logincnt);
	let registerbtn = document.createElement("button")
	registerbtn.innerText = "Register"
	registerbtn.style.width = "100%";
	logincnt.appendChild(registerbtn);
	let connectbtn = document.createElement("button")
	connectbtn.innerText = "Connect to other server..."
	connectbtn.style.width = "100%";
	logincnt.appendChild(connectbtn);
	document.body.appendChild(logincnt);
	addRipple(loginbtn,"rgba(255,200,0,0.6)");
	addRipple(registerbtn,"rgba(255,200,0,0.6)");
	addRipple(connectbtn,"rgba(255,200,0,0.6)");
	
	loginbtn.addEventListener("click",function() {
		loginbtn.disabled = true;
		registerbtn.disabled = true;
		
		fetch(currserver + "login", {body: JSON.stringify({'email': emailtb.value,'password': passwordtb.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
					loadmainarea();
				})
			}else {
				res.json().then((json) => {
					errlbl.innerText = json.description;
				});
				loginbtn.disabled = false;
				registerbtn.disabled = false;
			}
		}).catch(() => {
			loginbtn.disabled = false;
			registerbtn.disabled = false;
		})
	})
	
	registerbtn.addEventListener("click",function() {
		loginbtn.disabled = true;
		registerbtn.disabled = true;
		
		fetch(currserver + "signup", {body: JSON.stringify({'email': emailtb.value,'password': passwordtb.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
					loadmainarea();
				})
			}else {
				res.json().then((json) => {
					errlbl.innerText = json.description;
				});
				loginbtn.disabled = false;
				registerbtn.disabled = false;
			}
		}).catch(() => {
			loginbtn.disabled = false;
			registerbtn.disabled = false;
		})
	})
	
	connectbtn.addEventListener("click",function() {
		openconnectarea();
	})
}

function loadmainarea() {
	Notification.requestPermission();

	document.body.innerHTML = "";
	let maincont = document.createElement("main");
	let leftarea = document.createElement("leftarea");
	let titlebar = document.createElement("titlebar");
	let rightarea = document.createElement("rightarea");

	function viewuginfo(ugid,type) {
		let diag = opendialog();
		diag.title.innerText = "Info";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";

		//Content
		let pfpimge = document.createElement("img");
		pfpimge.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
		pfpimge.classList.add("circleimg");
		pfpimge.loading = "lazy";
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.flexShrink = "0";
		pfpimge.classList.add("loading");
		diag.inner.appendChild(pfpimge);

		let infotxt = document.createElement("label");
		infotxt.style.margin = "6px";
		infotxt.style.fontSize = "10px";
		infotxt.innerText = "loading...";
		infotxt.classList.add("loading");
		diag.inner.appendChild(infotxt);

		let infotable = document.createElement("table");
		diag.inner.appendChild(infotable);

		if (type == "user") {
			fetch(currserver + "getuser", {body: JSON.stringify({'token': logininfo.token, 'uid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);

						pfpimge.classList.remove("loading");
						pfpimge.src = getpfp(infod.picture);

						fetch(currserver + "getonline", {body: JSON.stringify({'token': logininfo.token, 'uid': ugid}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									infotxt.classList.remove("loading");
									if (text == "Online") {
										infotxt.innerText = "Online";
									}else {
										let dt = new Date(text);
										infotxt.innerText = "Last Online: " + dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + ", " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
									}
								})
							}
						});
						
						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = "Name";
						namettl.style.fontWeight = "bold";
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						nameval.innerText = infod.name;
						namerow.appendChild(nameval);

						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.style.fontWeight = "bold";
						desttl.innerText = "Bio";
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						desval.innerText = infod.description;
						desrow.appendChild(desval);

						infotable.appendChild(namerow);
						infotable.appendChild(desrow);

					})
				}else {
					diag.inner.innerText = "Error";
				}
			}).catch(function() {
				diag.inner.innerText = "Error";
			});
		}else {
			fetch(currserver + "getgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);
						
						let f = document.createElement('input');
						f.type='file';
						f.accept = 'image/*';
						
						let ufl = false;
						let file;
						
						pfpimge.classList.remove("loading");
						pfpimge.style.cursor = "pointer";
						pfpimge.title = "Click to upload";
						pfpimge.src = getpfp(infod.picture,"group.svg");
						pfpimge.addEventListener("click",function () {f.click();})
						
						infotxt.innerText = ugid;
						infotxt.classList.remove("loading");

						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = "Name";
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						let nameinp = document.createElement("input");
						nameinp.value = infod.name;
						nameval.appendChild(nameinp);
						namerow.appendChild(nameval);
						infotable.appendChild(namerow);
						
						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.innerText = "Description";
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						let desinp = document.createElement("input");
						desinp.value = infod.info;
						desval.appendChild(desinp);
						desrow.appendChild(desval);
						infotable.appendChild(desrow);

						let pubrow = document.createElement("tr");
						let pubttl = document.createElement("td");
						pubttl.innerText = "Public";
						pubrow.appendChild(pubttl);
						let pubval = document.createElement("td");
						let pubinp = document.createElement("input");
						pubinp.type = "checkbox";
						pubinp.checked = infod.publicgroup;
						pubval.appendChild(pubinp);
						pubrow.appendChild(pubval);
						infotable.appendChild(pubrow);
						
						let roles = {};
						let crole = {};
						fetch(currserver + "getgrouprole", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									crole = JSON.parse(text);
									if (crole.AllowEditingSettings == true) {
										let editrolesbtn = document.createElement("button");
										editrolesbtn.innerText = "Edit Roles";
										editrolesbtn.addEventListener("click",function() {
											let diaga = opendialog();
											diaga.title.innerText = "Edit Roles";
											diaga.inner.style.display = "flex";
											diaga.inner.style.flexDirection = "column";
											diaga.inner.style.alignItems = "center";

											fetch(currserver + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
												if (res.ok) {
													res.text().then((text) => {
														roles = JSON.parse(text);
														rokeys = Object.keys(roles);

														rokeys.forEach(function(a) {
															let x = a;
															let role = roles[a];
															let rt = document.createElement("h4");
															rt.innerText = a;
															diaga.inner.appendChild(rt);
															let kcont = document.createElement("div");
															kcont.style.width = "100%";
															let rkeys = Object.keys(role);
															rkeys.forEach(function(aa) {
																let a = aa;
																let i = role[aa];
																if (aa != "AdminOrder") {
																	let ccont = document.createElement("div");
																	ccont.style.display = "flex";
																	let pcb = document.createElement("input");
																	pcb.type = "checkbox";
																	pcb.checked = i;
																	let pl = document.createElement("label");
																	pl.innerText = aa;
																	pl.for = pcb;
																	pcb.addEventListener("change",function() {
																		i = pcb.checked;
																		role[a] = i;
																		roles[x] = role;
																	})
																	ccont.appendChild(pcb);
																	ccont.appendChild(pl);
																	diaga.inner.appendChild(ccont);
																}
															})
															diaga.inner.appendChild(kcont);
														});
													});
												}
											});
										})
										diag.inner.appendChild(editrolesbtn);
										fetch(currserver + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {
													roles = JSON.parse(text);
													diag.inner.appendChild(savebtn);
												});
											}
										});
									}else {
										nameinp.readOnly = true;
										desinp.readOnly = true;
										pubinp.disabled = true;
									}
									if (crole.AdminOrder != -1) {
										diag.inner.appendChild(leavebtn);
									}
								})
							}
						});
						let membersbtn = document.createElement("button");
						membersbtn.innerText = "Members";
						membersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};
							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = "Members";
							let userstable = createLazyList("div","div");
							userstable.setItemGenerator(function(ukeys,e,urow) {
								let user = users[ukeys[e]];
								if (user == undefined) return;
								urow.style.display = "flex";
								urow.style.width = "100%";
								urow.style.height = "40px";
								let uname = document.createElement("div");
								uname.style.display = "flex";
								uname.style.alignItems = "center";
								uname.style.width = "100%";
								let userpfp = document.createElement("img");
								userpfp.classList.add("circleimg");
								userpfp.classList.add("loading");
								userpfp.loading = "lazy";
								userpfp.style.cursor = "pointer";
								userpfp.addEventListener("click",function() {
									viewuginfo(user.user,"user");
								});
								let usernamelbl = document.createElement("label");
								usernamelbl.classList.add("loading");
								usernamelbl.innerText = "loading..."
								usernamelbl.style.marginLeft = "4px";
								uname.appendChild(userpfp);
								uname.appendChild(usernamelbl);
								getinfo(user.user,function(uii) {
									userpfp.src = getpfp(uii.picture);
									usernamelbl.innerText = uii.name;
									userpfp.classList.remove("loading");
									usernamelbl.classList.remove("loading");
									userpfp.title = "View profile of " + uii.name;
								});
								urow.appendChild(uname);
								let urole = document.createElement("div");
								urole.style.minWidth = "100px";
								urole.style.display = "flex";
								urole.style.alignItems = "center";
								if (!crole.AllowEditingUsers) {
									urole.innerText = user.role;
								}else {
									let roleselect = document.createElement("select");
									roleselect.title = "Change role of this user";
									roleselect.style.width = "100%";
									rokeys.forEach(function(i) {
										let opt = document.createElement("option");
										opt.value = i;
										opt.innerText = i;
										roleselect.appendChild(opt);
									})
									roleselect.value = user.role;
									roleselect.addEventListener("change",function() {
										//alert("wait..")
										fetch(currserver + "edituser", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'userid': user.user, 'role': roleselect.value }),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {

												})
											}else {

											}
										})
									});
									urole.appendChild(roleselect);
								}
								urow.appendChild(urole);
								if (crole.AllowKicking || crole.AllowBanning) {
									let uacts = document.createElement("div");
									function remove() { //When user is removed
										urow.style.opacity = "0.5";
										urole.remove();
										uacts.remove();
									}
									uacts.style.width = "68px";
									uacts.style.display = "flex";
									uacts.style.flexShrink = "0";
									if (crole.AllowKicking) {
										let kickbtn = document.createElement("button");
										kickbtn.classList.add("cb");
										kickbtn.title = "Kick";
										kickbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M640-520v-80h240v80H640Zm-280 40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/></svg>';
										kickbtn.addEventListener("click",function() {
											if (confirm("Do you really want to kick this user?")) {
												fetch(currserver + "kickuser", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'uid': user.user}),method: 'POST'}).then((res) => {
													if (res.ok) {
														remove();
													}
												})
											}
										})
										uacts.appendChild(kickbtn);
									}
									if (crole.AllowBanning) {
										let banbtn = document.createElement("button");
										banbtn.classList.add("cb");
										banbtn.title = "Ban";
										banbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z"/></svg>';
										banbtn.addEventListener("click",function() {
											if (confirm("Do you really want to ban this user?")) {
												fetch(currserver + "banuser", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'uid': user.user}),method: 'POST'}).then((res) => {
													if (res.ok) {
														remove();
													}
												})
											}
										})
										uacts.appendChild(banbtn);
									}
									urow.appendChild(uacts);
								}
							});
							userstable.setGetSize(function(list,idx) {return 52});
							diag.inner.appendChild(userstable.element);
							fetch(currserver + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
								if (res.ok) {
									res.text().then((text) => {
										roles = JSON.parse(text);
										rokeys = Object.keys(roles);
										fetch(currserver + "getgroupusers", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {
													users = JSON.parse(text);
													let ukeys = Object.keys(users);
													let cuser = users[logininfo.uid];
													if (cuser) {
														crole = roles[cuser.role];
													}
													userstable.setList(ukeys);
												});
											}
										});
									});
								}
							});
						})
						diag.inner.appendChild(membersbtn);

						let bannedusersbtn = document.createElement("button");
						bannedusersbtn.innerText = "Banned Members";
						bannedusersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};
							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = "Banned members";
							let userstable = createLazyList("div","div");
							userstable.element.style.height = "100%";
							userstable.setItemGenerator(function(ukeys,e,urow) {
								let user = ukeys[e];
								if (user == undefined) return;
								urow.style.display = "flex";
								urow.style.width = "100%";
								urow.style.height = "40px";
								let uname = document.createElement("div");
								uname.style.display = "flex";
								uname.style.alignItems = "center";
								uname.style.width = "100%";
								let userpfp = document.createElement("img");
								userpfp.classList.add("circleimg");
								userpfp.classList.add("loading");
								userpfp.loading = "lazy";
								userpfp.style.cursor = "pointer";
								userpfp.addEventListener("click",function() {
									viewuginfo(user,"user");
								});
								let usernamelbl = document.createElement("label");
								usernamelbl.classList.add("loading");
								usernamelbl.innerText = "loading..."
								usernamelbl.style.marginLeft = "4px";
								uname.appendChild(userpfp);
								uname.appendChild(usernamelbl);
								getinfo(user,function(uii) {
									userpfp.src = getpfp(uii.picture);
									usernamelbl.innerText = uii.name;
									userpfp.classList.remove("loading");
									usernamelbl.classList.remove("loading");
									userpfp.title = "View profile of " + uii.name;
								});
								urow.appendChild(uname);
								if (crole.AllowBanning) {
									let uacts = document.createElement("div");
									function remove() { //When user is removed
										urow.style.opacity = "0.5";
										uacts.remove();
									}
									uacts.style.width = "34px";
									uacts.style.display = "flex";
									uacts.style.flexShrink = "0";
									let unbanbtn = document.createElement("button");
									unbanbtn.classList.add("cb");
									unbanbtn.title = "Unban";
									unbanbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>';
									unbanbtn.addEventListener("click",function() {
										if (confirm("Do you really want to unban this user?")) {
											fetch(currserver + "unbanuser", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'uid': user}),method: 'POST'}).then((res) => {
												if (res.ok) {
													remove();
												}else {

												}
											})
										}
									})
									uacts.appendChild(unbanbtn);
									urow.appendChild(uacts);
								}
							});
							userstable.setGetSize(function(list,idx) {return 52});
							diag.inner.appendChild(userstable.element);
							fetch(currserver + "getbannedgroupmembers", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
								if (res.ok) {
									res.text().then((text) => {
										let users = JSON.parse(text);
										userstable.setList(users);
									});
								}
							});
						})
						diag.inner.appendChild(bannedusersbtn);

						
						let savebtn = document.createElement("button");
						savebtn.innerText = "Save";
						savebtn.addEventListener("click",function() {
							if (ufl) {
								fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
									console.log(data);
									ufl = false;
									if (data.status == "success") {
										fetch(currserver + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value, 'roles': roles, 'publicgroup': pubinp.checked }),method: 'POST'}).then((res) => {
											if (res.ok) {

											}else {
												
											}
										})
									}
								})}).catch(function(error) {console.error(error);});
							}else {
								fetch(currserver + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'name': nameinp.value, 'picture': infod.picture, 'info': desinp.value, 'roles': roles, 'publicgroup': pubinp.checked }),method: 'POST'}).then((res) => {
									if (res.ok) {

									}else {
										
									}
								})
							}
						})

						let leavebtn = document.createElement("button");
						leavebtn.innerText = "Leave";
						leavebtn.addEventListener("click",function() {
							if (confirm("Do you really want to leave this group?\nIf you are the owner, promote someone else as the owner BEFORE leaving the group.")) {
								fetch(currserver + "leavegroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid }),method: 'POST'}).then((res) => {
									if (res.ok) {
										loadchats();
									}else {

									}
								})
							}
						})

						
						f.onchange = function() {
							if (f.files && f.files[0]) {
			
								let reader = new FileReader();
								reader.onload = function (e) { 
									pfpimge.setAttribute("src",reader.result);
									file = f.files[0];
									ufl = true;
								};

								reader.readAsDataURL(f.files[0]); 
							}
						}
					})
				}else {
					diag.inner.innerText = "Error";
				}
			}).catch(function() {
				diag.inner.innerText = "Error";
			});
		}
	}
	
	function opendialog() {
		let bgcover = document.createElement("div");
		bgcover.classList.add("bgcover");
		bgcover.style.alignItems = "center";
		bgcover.style.justifyContent = "center";
		bgcover.addEventListener("pointerdown",function(e) {
			if (e.target == bgcover) {
				document.body.removeChild(bgcover);
			}
		})
		
		let dialoginside = document.createElement("centeredPopup");
		dialoginside.tabIndex = "0";
		dialoginside.style.display = "flex";
		dialoginside.style.flexDirection = "column";
		let tflex = document.createElement("div");
		tflex.style.display = "flex";
		tflex.style.alignItems = "center";
		tflex.style.flexShrink = "0";
		let titlelbl = document.createElement("h4");
		titlelbl.innerText = "Dialog";
		titlelbl.style.marginRight = "auto";
		let closebtn = document.createElement("button");
		addRipple(closebtn,"rgba(255,200,0,0.6)");
		closebtn.title = "Close";
		closebtn.style.flexShrink = "0";
		closebtn.style.width = "25px";
		closebtn.style.height = "25px";
		closebtn.style.padding = "0";
		closebtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
		closebtn.addEventListener("click",function(e) {
			if (isatdock == true) {
				maincont.removeChild(dialoginside);
				
			}else {
				document.body.removeChild(bgcover);
				
			}
		})
		dialoginside.addEventListener("keydown",function(e) {
			if (e.key == "Escape") {
				closebtn.click();
			}
			//console.log(e.key)
		})
		let isatdock = false;
		
		let dockbtn = document.createElement("button");
		addRipple(dockbtn,"rgba(255,200,0,0.6)");
		dockbtn.title = "Dock to right";
		dockbtn.style.flexShrink = "0";
		dockbtn.style.width = "25px";
		dockbtn.style.height = "25px";
		dockbtn.style.padding = "0";
		dockbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-168h72v168h528v-528H216v168h-72v-168q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm216-144-51-51 105-105H144v-72h342L381-621l51-51 192 192-192 192Z"/></svg>';
		dockbtn.addEventListener("click",function(e) {
			if (isatdock == true) {
				document.body.appendChild(bgcover);
				bgcover.appendChild(dialoginside);
				dialoginside.classList.remove("docked")
			}else {
				document.body.removeChild(bgcover);
				bgcover.removeChild(dialoginside);
				maincont.appendChild(dialoginside);
				dialoginside.classList.add("docked")
			}
			isatdock = !isatdock;
		})
		
		tflex.appendChild(titlelbl);
		if (document.body.clientWidth > 1200) {tflex.appendChild(dockbtn)};
		tflex.appendChild(closebtn);
		dialoginside.appendChild(tflex);
		let innercont = document.createElement("div");
		innercont.style.overflow = "auto";
		innercont.style.minWidth = "100%";
		innercont.style.flexGrow = "1";
		dialoginside.appendChild(innercont);
		
		bgcover.appendChild(dialoginside);
		
		document.body.appendChild(bgcover);

		dialoginside.focus();
		
		return {
			bgcover: bgcover,
			dialog:dialoginside,
			title: titlelbl,
			inner:innercont,
			closebtn:closebtn
		}
	}

	function openmenu(menuitems, element) {
		let popupmenu = document.createElement("div");
		popupmenu.classList.add("popupmenu");
		popupmenu.tabIndex = "0";

		let rect = element.getBoundingClientRect();
		popupmenu.style.top = rect.top + rect.height + "px";
		popupmenu.style.left = rect.left + "px";

		menuitems.forEach(function(item) {
			let menuitem = document.createElement("button");
			let menuitemicon = document.createElement("div");
			let menuitemlabel = document.createElement("label");
			menuitem.appendChild(menuitemicon);
			menuitem.appendChild(menuitemlabel);
			menuitemlabel.innerText = item.content;
			if (item.icon) {
				menuitemicon.innerHTML = item.icon;
			}
			popupmenu.appendChild(menuitem);

			menuitem.addEventListener("click",function() {
				close();
				item.callback();
			})
		});

		function close() {
			//popupmenu.style.maxHeight = "0px";
			popupmenu.style.opacity = "";
			setTimeout(function() {
				popupmenu.remove();
			},200)
		}

		document.body.appendChild(popupmenu);
		popupmenu.focus();
		requestAnimationFrame(function() {
			let popuprect = popupmenu.getBoundingClientRect();
			if (popuprect.width + popuprect.left > document.body.clientWidth) {
				popupmenu.style.left = "";
				popupmenu.style.right = (document.body.clientWidth - rect.right) + "px";
			}
			popupmenu.style.opacity = "1";
			//popupmenu.style.maxHeight = "calc(100% - " + popupmenu.style.top + ")";
		});
		maincont.addEventListener("mousedown",function() {
			close();
		})
		popupmenu.addEventListener("keydown",function(e) {
			if (e.key == "Escape") close();
		})
	}
	
	let currentchatview;
	let chatitems = {};
	let readnotifications = [];
	let mutedchats = [];
	let servermutedchats = [];
	let ttimer = setInterval(function() {
		if (logininfo == undefined || logininfo == null) {
			clearTimeout(ttimer);
			return;
		}
		let req = {
			"getnotifications": JSON.stringify({'token': logininfo.token})
		};
		if (document.hasFocus()) {
			req["setonline"] = JSON.stringify({'token': logininfo.token});
		}
		fetch(currserver + "multi", {body: JSON.stringify(req),method: 'POST'}).then((res) => {
			res.json().then((json) => {
				{
					let getnotificationsrequest = json["getnotifications"];
					if (getnotificationsrequest.statuscode == 200) {
						let nots = JSON.parse(getnotificationsrequest.res);
						let list = Object.keys(nots);
						list.forEach(function(i) {
							if (!readnotifications.includes(i)) {
								let notif = nots[i];
								if ((document.hasFocus() == false || currentchatid != notif.chatid) && !mutedchats.includes(notif.chatid)) {
									Notification.requestPermission();
									var notification = new Notification(notif.user.name + ' - Pamukky', { body: notif.content, icon: getpfp(notif.user.picture) });
									var audio = new Audio('notif.mp3');
									audio.play();
									notification.addEventListener('click', (event) => {
										chatitems[notif.chatid].click();
									});
								}
								readnotifications.push(i);
							}
						})
					}
				}
				if (json["setonline"]) {
					let setonlinerequest = json["setonline"];
					if (setonlinerequest.statuscode != 200) {
						clearTimeout(ttimer);
						openloginarea();
					}
				}
			})
		})
	},3000)
	fetch(currserver + "setonline", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
		if (!res.ok) {
			openloginarea();
			clearTimeout(ttimer);
			return;
		}
		loadchats();
		getinfo(logininfo.uid, (info) => {
			namelbl.innerText = info.name;
			pfpimg.src = getpfp(info.picture);
			currentuser = info;
		})
		fetch(currserver + "getmutedchats", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => { //Get server-side muted chats.
			if (res.ok) {
				res.text().then((text) => {
					servermutedchats = JSON.parse(text);
				});
			}
		})
		mutedchats = JSON.parse(localStorage.getItem("mutedchats") ?? "[]");
	})

	let chatslist = createLazyList();
	let currentchatid = 0;
	function openchat(chatid) {
		let infoid = "0";
		let type;
		if (chatid.includes("-")) {
			let spl = chatid.split("-");
			if (spl[0] != logininfo.uid) {
				infoid = spl[0];
			}else {
				infoid = spl[1];
			}
			type = "user";
		}else {
			infoid = chatid;
			type = "group";
		}

		location.href = "#chat:" + chatid;

		if (currentchatview) {
			currentchatview.kill();
			rightarea.removeChild(currentchatview.chat);
		}
		currentchatview = createchatarea(chatid, infoid);
		currentchatid = chatid;
		//callback for get*info
		currentchatview.titlelabel.classList.add("loading");
		currentchatview.titlelabel.innerText = "loading...";
		currentchatview.pfp.classList.add("loading");
		getinfo(infoid, function callback(cinfo) {
			currentchatview.titlelabel.innerText = cinfo.name;
			currentchatview.pfp.src = getpfp(cinfo.picture, type == "user" ? "person.svg" : "group.svg");
			currentchatview.titlelabel.classList.remove("loading");
			currentchatview.pfp.classList.remove("loading");
		});

		rightarea.appendChild(currentchatview.chat)
		if (document.body.clientWidth <= 800) {
			rightarea.style.display = "flex";
			currentchatview.backbutton.style.display = ""
			currentchatview.backbutton.onclick = function() {
				rightarea.style.left = "";
				leftarea.style.display = "";
				currentchatid = "";
				location.href = "#mainarea";
				requestAnimationFrame(function() {leftarea.style.opacity = "1";})
				if (document.body.clientWidth <= 800) {
					setTimeout(function() {
						rightarea.style.display = "none";
						leftarea.style.display = "";
						currentchatview.chat.innerHTML = "";
					},500)
				}else {
					currentchatview.backbutton.style.display = "none";
				}
			}
			requestAnimationFrame(function() {
				setTimeout(function() {
					rightarea.style.left = "0px";
					leftarea.style.opacity = "0";
					setTimeout(function() {
						leftarea.style.display = "none";
					},500)
				},100)
			})
		}else {
			currentchatview.backbutton.style.display = "none"
			rightarea.style.display = "";
			leftarea.style.display = "";
		}
		chatslist.updateItem();
	}

	function hashchange(url) {
		if (url.includes("#")) {
			let hash = url.split("#")[1];
			if (hash.startsWith("chat:")) {
				let chat = hash.split(":")[1];
				if (chat != currentchatid) {
					openchat(chat);
				}
			}else if (hash == "mainarea") {
				if (currentchatview) {
					currentchatview.backbutton.click();
				}
			}
		}
	}

	window.addEventListener("hashchange", function(e) {
		hashchange(e.newURL);
	});
	hashchange(location.href);

	chatslist.element.classList.add("clist");
	chatslist.setGetSize(function(list,index) {
		if (index == 0) {
			return 32;
		}
		return 60;
	});
	chatslist.setItemGenerator(function(list,index,element) {
		if (index == 0) {
			let rfb = document.createElement("button");
			rfb.addEventListener("click",function() {
				loadchats();
			})
			rfb.innerText = "Refresh"
			element.appendChild(rfb);
			return;
		}
		if (index == list.length - 1) {
			let fabhint = document.createElement("label");
			fabhint.style.display = "block";
			fabhint.style.margin = "8px";
			fabhint.innerText = "Click on the \"+\" button to add a new chat.";
			element.appendChild(fabhint);
			return;
		}
		let item = list[index];
		if (item == undefined) return;
		if (!item.hasOwnProperty("lastmessage") || item["lastmessage"] == null) {
			item["lastmessage"] = {
				time: new Date(),
							   content: "No Messages. Send one to start conversation.",
							   sender: 0
			}
		}
		let id = item["chatid"] ?? item.group;
		let itmcont = document.createElement("button");
		itmcont.classList.add("chatitem");
		addRipple(itmcont,"rgba(255,200,0,0.6)");
		chatitems[id] = itmcont;
		let pfpimg = document.createElement("img")
		pfpimg.loading = "lazy";
		pfpimg.classList.add("loading");
		itmcont.appendChild(pfpimg);
		let infocnt = document.createElement("infoarea");
		let namecont = document.createElement("titlecont");
		let nameh4 = document.createElement("h4");
		nameh4.innerText = "Loading...";
		nameh4.classList.add("loading");
		namecont.appendChild(nameh4)
		let lmt = document.createElement("time");
		let dt = new Date(item.lastmessage.time);
		let dtt = new Date(item.lastmessage.time);
		let nowdate = new Date();
		//try {
		if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
			lmt.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
		}else {
			lmt.innerText = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
		}
		//}catch {}
		namecont.appendChild(lmt);
		infocnt.appendChild(namecont);
		let lastmsgcontent = document.createElement("label");
		lastmsgcontent.classList.add("loading");
		lastmsgcontent.innerText = "User: " + item.lastmessage.content.split("\n")[0];
		getinfo(item.lastmessage.sender, function(sender) {
			lastmsgcontent.innerText = sender.name + ": " + item.lastmessage.content.split("\n")[0];
			lastmsgcontent.classList.remove("loading");
		});

		infocnt.appendChild(lastmsgcontent)
		itmcont.appendChild(infocnt);

		itmcont.addEventListener("click",function() {
			openchat(id);
		})

		getinfo(item.type == "user" ? item.user : item.group, function(info) {
			pfpimg.src = getpfp(info.picture, item.type == "user" ? "person.svg" : "group.svg");
			nameh4.innerText = info.name;
			nameh4.classList.remove("loading");
			pfpimg.classList.remove("loading");
		});
		element.appendChild(itmcont);
	});

	chatslist.setItemUpdater(function(list,index,element) {
		let itmcont = element.children[0];
		if (itmcont.classList.contains("chatitem")) {
			let item = list[index];
			if (item == undefined) return;
			let id = item["chatid"] ?? item.group;
			itmcont.classList.toggle("active", document.body.clientWidth > 800 && currentchatid == id);
		}
	});
	/*let clbtm = document.createElement("div");
	clbtm.style.height = "24px";
	chatslist.appendChild(clbtm);*/
	//chatslist.style.paddingBottom = "24px";
	let fab = document.createElement("button");
	fab.classList.add("fab");
	fab.title = "Add new chat";
	fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40"><path d="M446.667-446.667H200v-66.666h246.667V-760h66.666v246.667H760v66.666H513.333V-200h-66.666v-246.667Z"/></svg>';
	leftarea.appendChild(fab);
	let profilebtn = document.createElement("button");
	profilebtn.title = "Edit profile...";
	profilebtn.style.height = "100%";
	profilebtn.classList.add("transparentbtn")
	profilebtn.style.display = "flex";
	profilebtn.style.alignItems = "center";
	addRipple(profilebtn,"rgba(255,200,0,0.6)");

	let pfpimg = document.createElement("img");
	pfpimg.classList.add("circleimg")
	pfpimg.style.margin = "4px";
	profilebtn.appendChild(pfpimg);
	let namelbl = document.createElement("label");
	namelbl.style.margin = "4px";
	profilebtn.appendChild(namelbl);
	
	fab.addEventListener("click",function() {
		let diag = opendialog();
		diag.title.innerText = "Add Chat";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		let tinput = document.createElement("input");
		tinput.style.width = "100%";
		diag.inner.appendChild(tinput);
		
		let bflex = document.createElement("div");
		bflex.style.display = "flex";
		diag.inner.appendChild(bflex);
		
		let adduserchatbtn = document.createElement("button");
		adduserchatbtn.innerText = "Add User Chat";
		adduserchatbtn.addEventListener("click",function() {
			fetch(currserver + "adduserchat", {body: JSON.stringify({'token': logininfo.token,'email': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						loadchats();
						diag.closebtn.click();
					})
				}
			})
		})
		bflex.appendChild(adduserchatbtn);
		
		let creategroupbtn = document.createElement("button");
		creategroupbtn.innerText = "Create Group";
		creategroupbtn.addEventListener("click",function() {
			let f = document.createElement('input');
			f.type='file';
			f.accept = 'image/*';
			
			let ufl = false;
			let file;
			
			let diaga = opendialog();
			diaga.title.innerText = "Create Group";
			diaga.inner.style.display = "flex";
			diaga.inner.style.flexDirection = "column";
			diaga.inner.style.alignItems = "center";
			
			let pfpimge = document.createElement("img");
			pfpimge.classList.add("circleimg");
			pfpimge.style.width = "80px";
			pfpimge.style.height = "80px";
			pfpimge.style.cursor = "pointer";
			pfpimge.title = "Click to upload";
			//pfpimge.src = currentuser.picture.replace(/%SERVER%/g,currserver);
			pfpimge.addEventListener("click",function () {f.click();})
			diaga.inner.appendChild(pfpimge);
			
			let infotable = document.createElement("table");
			
			let namerow = document.createElement("tr");
			let namettl = document.createElement("td");
			namettl.innerText = "Name";
			namerow.appendChild(namettl);
			let nameval = document.createElement("td");
			let nameinp = document.createElement("input");
			nameinp.value = "New Group";
			nameval.appendChild(nameinp);
			namerow.appendChild(nameval);
			infotable.appendChild(namerow);
			
			let desrow = document.createElement("tr");
			let desttl = document.createElement("td");
			desttl.innerText = "Description";
			desrow.appendChild(desttl);
			let desval = document.createElement("td");
			let desinp = document.createElement("input");
			desinp.value = "This is my new group!";
			desval.appendChild(desinp);
			desrow.appendChild(desval);
			infotable.appendChild(desrow);
			diaga.inner.appendChild(infotable);
			
			let bflex = document.createElement("div");
			bflex.style.display = "flex";
			diaga.inner.appendChild(bflex);
			
			let createbtn = document.createElement("button");
			createbtn.innerText = "Create Group";
			createbtn.addEventListener("click",function() {
				if (ufl) {
					fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
						console.log(data);
						if (data.status == "success") {
							fetch(currserver + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value }),method: 'POST'}).then((res) => {
								loadchats();
								diag.closebtn.click();
								diaga.closebtn.click();
							})
						}
					})}).catch(function(error) {console.error(error);});
				}else {
					fetch(currserver + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': "", 'info': desinp.value }),method: 'POST'}).then((res) => {
						loadchats();
						diag.closebtn.click();
						diaga.closebtn.click();
					})
				}
			})
			bflex.appendChild(createbtn);
			
			f.onchange = function() {
				if (f.files && f.files[0]) {

					let reader = new FileReader();
					reader.onload = function (e) { 
						pfpimge.setAttribute("src",reader.result);
						file = f.files[0];
						ufl = true;
					};

					reader.readAsDataURL(f.files[0]); 
				}
			}
		})
		bflex.appendChild(creategroupbtn);
		
		let joingroupbtn = document.createElement("button");
		joingroupbtn.innerText = "Join Group";
		joingroupbtn.addEventListener("click",function() {
			fetch(currserver + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					loadchats();
					diag.closebtn.click();
				}
			})
		})
		bflex.appendChild(joingroupbtn);
	})
	profilebtn.addEventListener("click",function() {
		let f = document.createElement('input');
		f.type='file';
		f.accept = 'image/*';
		
		let ufl = false;
		let file;
		
		let diag = opendialog();
		diag.title.innerText = "Edit Profile";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		
		let pfpimge = document.createElement("img");
		pfpimge.classList.add("circleimg");
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.cursor = "pointer";
		pfpimge.title = "Click to upload";
		pfpimge.src = getpfp(currentuser.picture);
		pfpimge.addEventListener("click",function () {f.click();})
		diag.inner.appendChild(pfpimge);
		
		let infotable = document.createElement("table");
		let namerow = document.createElement("tr");
		let namettl = document.createElement("td");
		namettl.innerText = "Name";
		namerow.appendChild(namettl);
		let nameval = document.createElement("td");
		let nameinp = document.createElement("input");
		nameinp.value = currentuser.name;
		nameval.appendChild(nameinp);
		namerow.appendChild(nameval);
		
		let desrow = document.createElement("tr");
		let desttl = document.createElement("td");
		desttl.innerText = "Bio";
		desrow.appendChild(desttl);
		let desval = document.createElement("td");
		let desinp = document.createElement("input");
		desinp.value = currentuser.description;
		desval.appendChild(desinp);
		desrow.appendChild(desval);
		
		
		infotable.appendChild(namerow);
		infotable.appendChild(desrow);
		diag.inner.appendChild(infotable);
		
		let cpass = document.createElement("button");
		cpass.innerText = "Change Password";
		cpass.addEventListener("click",function() {
			let diag = opendialog();
			diag.title.innerText = "Change Password";
			diag.inner.style.display = "flex";
			diag.inner.style.flexDirection = "column";
			diag.inner.style.alignItems = "center";
			let cpasstable = document.createElement("table");
			let opr = document.createElement("tr");
			let pprt = document.createElement("td");
			pprt.innerText = "Old Password";
			opr.appendChild(pprt);
			let oprv = document.createElement("td");
			let oprinp = document.createElement("input");
			oprinp.type = "password";
			oprv.appendChild(oprinp);
			opr.appendChild(oprv);
			
			let npr = document.createElement("tr");
			let npt = document.createElement("td");
			npt.innerText = "New Password";
			npr.appendChild(npt);
			let nprv = document.createElement("td");
			let nprinp = document.createElement("input");
			nprinp.type = "password";
			nprv.appendChild(nprinp);
			npr.appendChild(nprv);
			
			let npc = document.createElement("tr");
			let npcc = document.createElement("td");
			npcc.innerText = "Confirm Password";
			npc.appendChild(npcc);
			let nprc = document.createElement("td");
			let npcinp = document.createElement("input");
			npcinp.type = "password";
			nprc.appendChild(npcinp);
			npc.appendChild(nprc);
			
			
			cpasstable.appendChild(opr);
			cpasstable.appendChild(npr);
			cpasstable.appendChild(npc);
			diag.inner.appendChild(cpasstable);
			
			let changebtn = document.createElement("button");
			changebtn.innerText = "Change";
			changebtn.addEventListener("click",function() {
				if (npcinp.value != nprinp.value) {
					alert("New and Confirm doesnt match!");
					return;
				}
				fetch(currserver + "changepassword", {body: JSON.stringify({'token': logininfo.token, 'oldpassword': oprinp.value, 'password': nprinp.value  }),method: 'POST'}).then((res) => {
					//if (res.ok) {
						res.text().then((text) => {
							
							info = JSON.parse(text);
							if (info["status"] == "error") {
								alert(text);
								return;
							}
							//logininfo = info;
							alert("Password Changed!");
						})
					//}else {
						
					//}
				})
			});
			diag.inner.appendChild(changebtn);
		})
		diag.inner.appendChild(cpass);
		
		let savebtn = document.createElement("button");
		savebtn.innerText = "Save";
		savebtn.addEventListener("click",function() {
			if (ufl) {
				fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
					console.log(data);
					if (data.status == "success") {
						ufl = false;
						currentuser.picture = data.url;
						fetch(currserver + "updateuser", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': currentuser.picture,'description': desinp.value }),method: 'POST'}).then((res) => {
							if (res.ok) {
								namelbl.innerText = nameinp.value;
								pfpimg.src = getpfp(currentuser.picture);
							}
						})
					}
				})}).catch(function(error) {console.error(error);});
			}else {
				fetch(currserver + "updateuser", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': currentuser.picture,'description': desinp.value  }),method: 'POST'}).then((res) => {
					if (res.ok) {
						namelbl.innerText = nameinp.value;
					}
				})
			}
		})
		
		diag.inner.appendChild(savebtn);
		
		
		let lout = document.createElement("button");
		lout.innerText = "Logout";
		lout.addEventListener("click",function() {
			fetch(currserver + "logout", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
				if (res.ok) {
					localStorage.setItem("logininfo", null);
					location.reload();
				}
			});
		})
		diag.inner.appendChild(lout);
		
		f.onchange = function() {
			if (f.files && f.files[0]) {

				let reader = new FileReader();
				reader.onload = function (e) {
					let cic = document.createElement("div");
					cic.style.width = "256px";
					cic.style.height = "256px";
					cic.style.overflow = "hidden";
					cic.style.position = "relative";
					let ci = document.createElement("img");
					ci.setAttribute("src",reader.result);
					ci.onload = function() {
						//if (ci.naturalWidth < 256 && ci.naturalHeight < 256) {
							file = f.files[0];
							ufl = true;
							pfpimge.setAttribute("src",reader.result);
							return;
						/*}
						alert("Sorry! cropping is TODO, please upload a picture that is smaller than 256x256")
						return;
						ci.style.position = "absolute";
						let cdiag = opendialog();
						cdiag.title.innerText = "Crop";
						cdiag.inner.style.display = "flex";
						cdiag.inner.style.flexDirection = "column";
						cdiag.inner.style.alignItems = "center";
						ci.ondragstart = function() { return false; };
						let dragging = false;
						let lastx = 0;
						let lasty = 0;
						let ix = 0;
						let iy = 0;
						function updatepos() {
							if (ix > 0) {
								ix = 0;
							}
							if (iy > 0) {
								iy = 0;
							}
							if (ix < -(ci.naturalWidth - 256)) {
								ix = -(ci.naturalWidth - 256);
							}
							if (iy < -(ci.naturalHeight - 256)) {
								iy = -(ci.naturalHeight - 256);
							}
							ci.style.top = iy + "px";
							ci.style.left = ix + "px";
						}
						cic.addEventListener("pointerdown", (e) => {dragging = true;lastx = e.clientX;lasty = e.clientY;});
						document.body.addEventListener("pointerup", (e) => {dragging = false});
						document.body.addEventListener("pointermove", (e) => {
							if (dragging) {
								ix += e.clientX - lastx;
								iy += e.clientY - lasty;
								updatepos();
							}
							lastx = e.clientX;lasty = e.clientY;
							e.preventDefault();
							
						});
						cic.appendChild(ci);
						cdiag.inner.appendChild(cic);
						let cbtn = document.createElement("button");
						cbtn.innerText = "Crop";
						cbtn.addEventListener("click",function() {
							let canvas = document.createElement("canvas");
							canvas.width = 256;
							canvas.height = 256;
							const ctx = canvas.getContext("2d");
							ctx.drawImage(ci, ix, iy); 
							
							diag.closebtn.click();	
						})
						cdiag.inner.appendChild(cbtn);*/
					}
					
					
				};

				reader.readAsDataURL(f.files[0]); 
			}
		}
	});
	function loadchats() {
		fetch(currserver + "getchatslist", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					chats = JSON.parse(text);
					chatslist.setList([{}, ...chats, {}]);
				})
			}
		})
	}
	
	titlebar.appendChild(profilebtn);
	leftarea.appendChild(titlebar);
	leftarea.appendChild(chatslist.element);
	maincont.appendChild(leftarea);
	maincont.appendChild(rightarea);
	
	document.body.appendChild(maincont);


	function createchatarea(chatid,ugid) {
		let chatupdatetimer;
		function kill() {
			clearInterval(chatupdatetimer);
		}
		let f = document.createElement('input');
		f.type='file';
		f.multiple = true;
		
		let fileslist = [];
		let isuserchat = chatid.includes("-");
		let messageflexes = {};
		let pinnedmessages = {};
		let mchat = document.createElement("mchat");
		let titlebar = document.createElement("titlebar");
		let backbtn = document.createElement("button");
		addRipple(backbtn,"rgba(255,200,0,0.6)");
		backbtn.classList.add("cb")
		backbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M384-96 0-480l384-384 68 68-316 316 316 316-68 68Z"/></svg>';
		backbtn.style.display = "none";
		titlebar.appendChild(backbtn)
		let pfpimg = document.createElement("img");
		pfpimg.classList.add("circleimg")
		pfpimg.style.margin = "2px";
		titlebar.appendChild(pfpimg);
		let titletxt = document.createElement("h4");
		titletxt.style.marginLeft = "4px";
		titlebar.appendChild(titletxt);
		let infotxt = document.createElement("label");
		infotxt.style.fontSize = "10px";
		infotxt.style.margin = "6px";
		infotxt.innerText = "loading";
		infotxt.classList.add("loading");
		titlebar.appendChild(infotxt);
		titlebar.appendChild(document.createElement("ma"));
		
		let infobtn = document.createElement("button");
		addRipple(infobtn,"rgba(255,200,0,0.6)");
		infobtn.title = "Info";
		infobtn.classList.add("cb")
		infobtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M444-288h72v-240h-72v240Zm35.789-312Q495-600 505.5-610.289q10.5-10.29 10.5-25.5Q516-651 505.711-661.5q-10.29-10.5-25.5-10.5Q465-672 454.5-661.711q-10.5 10.29-10.5 25.5Q444-621 454.289-610.5q10.29 10.5 25.5 10.5Zm.487 504Q401-96 331-126q-70-30-122.5-82.5T126-330.958q-30-69.959-30-149.5Q96-560 126-629.5t82.5-122Q261-804 330.958-834q69.959-30 149.5-30Q560-864 629.5-834t122 82.5Q804-699 834-629.276q30 69.725 30 149Q864-401 834-331q-30 70-82.5 122.5T629.276-126q-69.725 30-149 30ZM480-168q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>';
		infobtn.addEventListener("click",function() {
			viewuginfo(ugid,isuserchat ? "user" : "group")
		})
		
		titlebar.appendChild(infobtn);
		let optionsbtn = document.createElement("button");
		addRipple(optionsbtn,"rgba(255,200,0,0.6)");
		optionsbtn.title = "Options";
		optionsbtn.classList.add("cb")
		optionsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M479.79-192Q450-192 429-213.21t-21-51Q408-294 429.21-315t51-21Q510-336 531-314.79t21 51Q552-234 530.79-213t-51 21Zm0-216Q450-408 429-429.21t-21-51Q408-510 429.21-531t51-21Q510-552 531-530.79t21 51Q552-450 530.79-429t-51 21Zm0-216Q450-624 429-645.21t-21-51Q408-726 429.21-747t51-21Q510-768 531-746.79t21 51Q552-666 530.79-645t-51 21Z"/></svg>';
		optionsbtn.addEventListener("click",function(e) {
			openmenu([{
				content: "Mute...",
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
				callback: function() {
					openmenu([
						{
							content: mutedchats.includes(chatid) ? "Unmute for this client" : "Mute for this client",
							icon: mutedchats.includes(chatid) ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
							callback: function() {
								let index = mutedchats.indexOf(chatid);
								if (index > -1) {
									mutedchats.splice(index, 1);
								}else {
									mutedchats.push(chatid);
								}
								localStorage.setItem("mutedchats", JSON.stringify(mutedchats));
							}
						}, {
							content: servermutedchats.includes(chatid) ? "Unmute for this account" : "Mute for this account",
							icon: servermutedchats.includes(chatid) ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
							callback: function() {
								fetch(currserver + "mutechat", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'toggle': !servermutedchats.includes(chatid)}),method: 'POST'}).then((res) => {
									if (res.ok) {
										let index = servermutedchats.indexOf(chatid);
										if (index > -1) {
											servermutedchats.splice(index, 1);
										}else {
											servermutedchats.push(chatid);
										}
									}
								})
							}
						}
					], optionsbtn);
				}
			}], optionsbtn);
		})
		
		titlebar.appendChild(optionsbtn);
		mchat.appendChild(titlebar);


		let messageslist = document.createElement("messageslist");
		let pinnedmessageslist = document.createElement("messageslist");
		pinnedmessageslist.style.display = "none";

		let pinnedbar = document.createElement("pinbar");
		pinnedbar.style.display = "none";
		let mpint = document.createElement("replycont");
		pinnedbar.appendChild(mpint);
		let pinsbtn = document.createElement("button");
		pinsbtn.title = "Pinned messages";
		addRipple(pinsbtn,"rgba(255,200,0,0.6)");
		pinsbtn.classList.add("cb")
		pinsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';
		pinnedbar.appendChild(pinsbtn);
		mchat.appendChild(pinnedbar);

		function updatepinnedmessageslist() {
			pinnedmessageslist.innerHTML = "";
			for (const [key, msg] of Object.entries(pinnedmessages)) {
				let msgd = createmsg(msg,key);
				pinnedmessageslist.appendChild(msgd.message);
			}
		}

		pinsbtn.addEventListener("click",function() {
			if (messageslist.style.display == "") {
				pinnedmessageslist.style.display = "";
				messageslist.style.display = "none";
				mgb.style.display = "none";
				updatepinnedmessageslist();
			}else {
				pinnedmessageslist.style.display = "none";
				messageslist.style.display = "";
				if (crole.AllowSending == true) {
					mgb.style.display = "";
				}else {
					mgb.style.display = "none";
				}
			}
		});

		let pinsender = document.createElement("b");
		let pincontent = document.createElement("label");
		mpint.appendChild(pinsender);
		mpint.appendChild(pincontent);
		function updatepinnedbar() {
			let k = Object.keys(pinnedmessages);
			if (k.length > 0) {
				pinnedbar.style.display = "";
				messageslist.scrollTop += 56;
				let msg = pinnedmessages[k[k.length - 1]];
				pincontent.innerText = msg.content;
				pinsender.classList.add("loading");
				pinsender.innerText = "loading...";
				getinfo(msg.sender,function(info) {
					pinsender.classList.remove("loading");
					pinsender.innerText = info.name;
				})
				if (pinnedmessageslist.style.display == "") {
					updatepinnedmessageslist();
				}
			}else {
				pinnedbar.style.display = "none";
				if (pinnedmessageslist.style.display == "") {
					pinsbtn.click();
				}
			}
		}
		
		mchat.appendChild(pinnedmessageslist);
		mchat.appendChild(messageslist);

		
		let mgb = document.createElement("msgbar");
		let rc = document.createElement("replycont");
		addRipple(rc,"rgba(255,200,0,0.6)");
		rc.addEventListener("click",function() {
			rc.style.display = "none";
			replymsgid = undefined;
		})
		let replysname = document.createElement("b");
		
		rc.appendChild(replysname);
		let replycnt = document.createElement("label");
		
		rc.appendChild(replycnt);
		mgb.appendChild(rc);
		
		function uploadfile(file) {
			let reader = new FileReader();
			reader.onload = function (e) { 
				ufl = true;
				let att = document.createElement("uploaditm");
				let ui = document.createElement("div");
				let rb = document.createElement("button")
				rb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
				let img = document.createElement("img");
				img.style.background = "white";
				let imgs = new Image();
				imgs.src = reader.result;
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					// dark mode
					img.src = "file_dark.svg";
				}else {
					img.src = "file.svg";
				}
				img.classList.add("msgimg");
				imgs.onload = function() {
					img.src = imgs.src;
				}
				ui.appendChild(img)
				att.appendChild(ui);
				att.appendChild(rb);
				atc.appendChild(att);
				fileslist.push(file);
				rb.addEventListener("click",function() {
					const index = fileslist.indexOf(file);
					if (index > -1) {
						fileslist.splice(index, 1);
						if (fileslist.length > 0) {
							sendbtn.disabled = false;
						}else {
							sendbtn.disabled = true;
						}
					}
					atc.removeChild(att);
				})
				sendbtn.disabled = false;
			};

			reader.readAsDataURL(file); 
		}
		
		let atc = document.createElement("attachmentscont");
		mgb.appendChild(atc);
		f.onchange = function() {
			if (f.files) {
				Array.prototype.forEach.call(f.files,function(i) {
					uploadfile(i);
				})
			}
			
		}
		
		rc.style.display = "none";
		
		mchat.addEventListener('dragover', (e) => {
			e.preventDefault()
		});
		mchat.addEventListener('drop', (e) => {
			Array.prototype.forEach.call(e.dataTransfer.files,function(i) {
				uploadfile(i);
			});
			e.preventDefault()
		});
		
		mchat.addEventListener("paste", async e => {
			
			if (!e.clipboardData.files.length) {
				return;
			}
			if (e.clipboardData.files.length > 0) {
				e.preventDefault();
			}
			
			Array.prototype.forEach.call(e.clipboardData.files,function(i) {
				uploadfile(i);
			});
		});
		
		let mgbd = document.createElement("div");
		let attachbtn = document.createElement("button");
		attachbtn.addEventListener("click", function() {f.click();})
		addRipple(attachbtn,"rgba(255,200,0,0.6)");
		attachbtn.title = "Add attachment";
		attachbtn.classList.add("cb")
		attachbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M640-520v-200h80v200h-80ZM440-244q-35-10-57.5-39T360-350v-370h80v476Zm30 164q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v300h-80v-300q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q25 0 47.5-6.5T560-186v89q-21 8-43.5 12.5T470-80Zm170-40v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>';
		mgbd.appendChild(attachbtn)
		let msginput = document.createElement("textarea");
		
		mgbd.appendChild(msginput)
		
		let sendbtn = document.createElement("button");
		addRipple(sendbtn,"rgba(255,200,0,0.6)");
		sendbtn.classList.add("cb");
		sendbtn.title = "Send";
		sendbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
		mgbd.appendChild(sendbtn)
		
		mgb.appendChild(mgbd);

		let typinglabel = document.createElement("label");
		typinglabel.classList.add("typinglabel");
		typinglabel.innerText = "Nobody is typing";
		typinglabel.style.opacity = "0";
		mgb.appendChild(typinglabel);

		mchat.appendChild(mgb)
		
		let chatpage;
		let lastmsgsender;
		let lastmsgtime = new Date(0);
		let msgscont;
		let selectedMessages = [];
		let sendedmessages = [];
		let crole = {"AdminOrder":0,"AllowMessageDeleting":true,"AllowEditingSettings":true,"AllowKicking":true,"AllowBanning":true,"AllowSending":true,"AllowEditingUsers":true,"AllowSendingReactions":true,"AllowPinningMessages":true};
		let replymsgid = undefined;
		
		if (!isuserchat) {
			fetch(currserver + "getgrouprole", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						crole = JSON.parse(text);
						if (crole.AllowSending == true) {

						}else {
							if (crole.AdminOrder == -1) {
								mgbd.innerHTML = "";
								let joinbtn = document.createElement("button");
								joinbtn.innerText = "Join Group";
								joinbtn.style.width = "100%";
								joinbtn.style.height = "100%";
								joinbtn.style.borderRadius = "0px";
								joinbtn.classList.add("transparentbtn");
								addRipple(joinbtn,"rgba(255,200,0,0.6)",true);
								mgbd.appendChild(joinbtn);
								joinbtn.addEventListener("click",function() {
									joinbtn.disabled = true;
									fetch(currserver + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': ugid}),method: 'POST'}).then((res) => {
										if (res.ok) {
											loadchats();
											openchat(chatid);
										}
									});
								})
							}else {
								mgbd.style.display = "none";
							}
						}
					})
				}
			});
			fetch(currserver + "getgroupmemberscount", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						infotxt.classList.remove("loading");
						infotxt.innerText = text + " Members";
					})
				}
			});
		}

		//let sizecache = {};

		/*messageslist.setGetSize(function(list,id) {
			if (list[id]) {
				if (sizecache[list[id].key]) {
					//console.log(sizecache[list[id].key]);
					return sizecache[list[id].key]
				}
				return 36;
			}
			return 0;
		});*/
		
		function addmsg(msg,id) {
			let dt = new Date(msg.time);
			let dtt = new Date(msg.time);
			if (dtt.setHours(0,0,0,0) != lastmsgtime.setHours(0,0,0,0)) {
				lastmsgtime = new Date(msg.time);
				addmsg({
					sender:0,
					content: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear(),
					   time: dt
				})
				//lastmsgsender = msg.sender;
			}
			if (msg.sender != lastmsgsender) {
				msgscont = document.createElement("msgscont");
				messageslist.appendChild(msgscont)
				lastmsgsender = msg.sender;
			}

			let r = createmsg(msg,id);
			messageflexes[id] = r.message;
			msgscont.appendChild(r.message);
			msgcdatas[id] = {message: r.message, status: r.status,msgreactions: r.msgreactions,reactions: r.reactions, pinned: r.pinned};
			return msgcdatas[id];
		}

		function createmsg(msg,id) {
			let dt = new Date(msg.time);
			let msgc = document.createElement("msgcont");
			function selectmessage() {
				if (selectedMessages.includes(id)) {
					selectedMessages.splice(selectedMessages.indexOf(id),1);
					msgc.style.background = "";
				}else {
					selectedMessages.push(id);
					msgc.style.background = "orange";
				}
			}
			msgc.addEventListener("click",function() {
				if (selectedMessages.length > 0) {
					selectmessage();
				}
			})

			msgc.addEventListener("contextmenu",function(event) {
				let tagname = event.target.tagName.toString();
				if (tagname.toLowerCase() == "video") return;
				if (tagname.toLowerCase() == "a") return;
				if (tagname.toLowerCase() == "img") return;
				if (msg.sender != 0) {
					let ctxdiv = document.createElement("div");
					ctxdiv.style.position = "absolute";
					ctxdiv.style.top = event.clientY + "px";
					ctxdiv.style.left = event.clientX + "px";
					ctxdiv.classList.add("customctx");
					ctxdiv.style.width = "315px";
					if (crole.AllowSendingReactions == true) {
						let reactionsdiv = document.createElement("div");
						reactionsdiv.style.maxWidth = "315px";
						reactionsdiv.style.overflow = "visible";
						reactionsdiv.style.marginBottom = "8px";
						reactionemojis.forEach((item) => {
							let itm = item.toString();
							let reactionbtn = document.createElement("button");
							reactionbtn.classList.add("reactionbtn");
							reactionbtn.innerText = itm;
							reactionsdiv.appendChild(reactionbtn);
							reactionbtn.addEventListener("click",function() {
								fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': id, reaction: itm}),method: 'POST'}).then((res) => {

								})
								clik();
							});
						});
						ctxdiv.appendChild(reactionsdiv);
					}
					let cnt = document.createElement("div");
					ctxdiv.appendChild(cnt);
					let replybutton = document.createElement("button");
					addRipple(replybutton,"rgba(255,200,0,0.6)",true);
					replybutton.innerText = "Reply";
					replybutton.disabled = !crole.AllowSending;
					replybutton.addEventListener("click", function() {
						replymsgid = id;
						rc.style.display = "";
						replycnt.innerText = msg.content;
						replysname.innerText = senderuser.name;
						clik();
					})
					cnt.appendChild(replybutton);
					let forwardbutton = document.createElement("button");
					addRipple(forwardbutton,"rgba(255,200,0,0.6)",true);
					forwardbutton.innerText = "Forward Message...";
					forwardbutton.addEventListener("click", function() {
						let diag = opendialog();
						diag.title.innerText = "Forward message";
						diag.inner.style.overflow = "hidden";
						diag.inner.style.display = "flex";
						diag.inner.style.flexDirection = "column";
						let fcb = document.createElement("div");
						fcb.classList.add("bbar");
						let cst = document.createElement("label");
						cst.style.overflowWrap = "anywhere";
						cst.style.width = "100%";
						fcb.appendChild(cst);
						let sb = document.createElement("button");
						sb.classList.add("cb");
						sb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
						fcb.appendChild(sb);
						let fchatselectsid = [];
						let gous = [];
						function refreshlabel() {
							cst.innerText = gous.join(", ");
						}
						let chatslist = createLazyList("div","button");
						chatslist.element.classList.add("clist");
						chatslist.setGetSize(function(list,index) {
							return 60;
						});
						chatslist.setItemGenerator(function(list,index,itmcont) {
							let item = list[index];
							if (item == undefined) return;
							if (!item.hasOwnProperty("lastmessage") || item["lastmessage"] == null) {
								item["lastmessage"] = {
									time: new Date(),
												   content: "No Messages. Send one to start conversation.",
												   sender: "0"
								}
							}
							itmcont.classList.add("chatitem");
							addRipple(itmcont,"rgba(255,200,0,0.6)");
							let pfpimg = document.createElement("img")
							itmcont.appendChild(pfpimg);
							let infocnt = document.createElement("infoarea");
							let namecont = document.createElement("titlecont");
							let nameh4 = document.createElement("h4");
							namecont.appendChild(nameh4)
							let lmt = document.createElement("time");
							let dt = new Date(item.lastmessage.time);
							let dtt = new Date(item.lastmessage.time);
							let nowdate = new Date();
							//try {
							if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
								lmt.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}else {
								lmt.innerText = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}
							//}catch {}
							namecont.appendChild(lmt);
							infocnt.appendChild(namecont);
							let lastmsgcontent = document.createElement("label")
							getinfo(item.lastmessage.sender, function(sender) {
								lastmsgcontent.innerText = sender.name + ": " + item.lastmessage.content.split("\n")[0];
							});
							infocnt.appendChild(lastmsgcontent)
							itmcont.appendChild(infocnt);
							let cinfo = {};
							let id = item["chatid"] ?? item.group;
							itmcont.addEventListener("click",function() {
								if (fchatselectsid.includes(id)) {
									gous.splice(fchatselectsid.indexOf(id),1);
									fchatselectsid.splice(fchatselectsid.indexOf(id),1);
								}else {
									fchatselectsid.push(id);
									gous.push(cinfo.name);
								}
								refreshlabel();
								chatslist.updateItem();
							})
							getinfo(item.type == "user" ? item.user : item.group, function(info) {
								pfpimg.src = getpfp(info.picture, item.type == "user" ? "person.svg" : "group.svg");
								nameh4.innerText = info.name;
								cinfo = info;
							});
						});

						chatslist.setItemUpdater(function(list,index,itmcont) {
							let item = list[index];
							if (item == undefined) return;
							let id = item["chatid"] ?? item.group;
							itmcont.style.background = fchatselectsid.includes(id) ? "orange" : "";
						});

						fetch(currserver + "getchatslist", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									chats = JSON.parse(text);
									chatslist.setList(chats);
								})
							}
						})
						diag.inner.appendChild(chatslist.element)
						diag.inner.appendChild(fcb)

						sb.onclick = function() {
							let messages = selectedMessages;
							if (messages.length == 0) messages = [id];
							fetch(currserver + "forwardmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages, 'tochats': fchatselectsid}),method: 'POST'}).then((res) => {

							})
							diag.closebtn.click();
						}
						clik();
					})
					cnt.appendChild(forwardbutton);
					let selectbutton = document.createElement("button");
					selectbutton.innerText = "Multi-Select";
					addRipple(selectbutton,"rgba(255,200,0,0.6)",true);
					selectbutton.addEventListener("click", function() {
						selectmessage();
						clik();
					})
					cnt.appendChild(selectbutton);
					let savebtn = document.createElement("button");
					savebtn.innerText = "Save Message";
					addRipple(savebtn,"rgba(255,200,0,0.6)",true);
					savebtn.addEventListener("click", function() {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currserver + "savemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages}),method: 'POST'}).then((res) => {

						})
						clik();
					})
					cnt.appendChild(savebtn);
					let pinbtn = document.createElement("button");
					pinbtn.innerText = "Pin Message";
					addRipple(pinbtn,"rgba(255,200,0,0.6)",true);
					pinbtn.addEventListener("click", function() {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currserver + "pinmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages}),method: 'POST'}).then((res) => {

						})
						clik();
					})
					pinbtn.disabled = !crole.AllowPinningMessages;
					cnt.appendChild(pinbtn);
					let copybutton = document.createElement("button");
					addRipple(copybutton,"rgba(255,200,0,0.6)",true);
					copybutton.innerText = "Copy selected text";
					copybutton.addEventListener("click", function() {
						document.execCommand('copy');
						clik();
					})
					cnt.appendChild(copybutton);
					let deletebutton = document.createElement("button");
					addRipple(deletebutton,"rgba(255,200,0,0.6)",true);
					deletebutton.innerText = "Delete Message";
					deletebutton.addEventListener("click", () => {
						if (confirm("Do you really want to delete?")) {
							let messages = selectedMessages;
							if (messages.length == 0) messages = [id];
							fetch(currserver + "deletemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages}),method: 'POST'}).then((res) => {

							})
						}
						clik();
					})
					cnt.appendChild(deletebutton);
					let clik = function() {ctxdiv.style.opacity = "0";setTimeout(function() {document.body.removeChild(ctxdiv); maincont.removeEventListener("pointerdown", clik);},200)}
					if (selectedMessages.length > 0) {
						deletebutton.disabled = false;
					}else {
						deletebutton.disabled = !(crole.AllowMessageDeleting || msg.sender == logininfo.uid);
					}

					ctxdiv.style.opacity = "0";
					document.body.appendChild(ctxdiv);
					requestAnimationFrame(function() {
						ctxdiv.style.opacity = "";
					});
					maincont.addEventListener("pointerdown",clik)
					if (event.clientX > document.body.clientWidth - ctxdiv.offsetWidth) {
						ctxdiv.style.left = (document.body.clientWidth - ctxdiv.offsetWidth) + "px";
					}
					if (event.clientY > document.body.clientHeight - ctxdiv.offsetHeight) {
						ctxdiv.style.top = (document.body.clientHeight - ctxdiv.offsetHeight) + "px";
					}
					event.preventDefault();
				}
			});
			let msgm = document.createElement("msgmain");
			let msgbubble = document.createElement("msgbubble");
			let msgcontent = document.createElement("msgcontent");
			let msgreactions = document.createElement("msgreacts");
			let msgtime = document.createElement("msgtime");
			let msgtimelbl = document.createElement("label");
			let msgsender = document.createElement("msgsender");
			let msgsendertxt = document.createElement("label");
			let msgpfp = document.createElement("img");
			msgpfp.classList.add("loading");
			msgsendertxt.innerText = "loading..."
			msgsendertxt.classList.add("loading");
			msgcontent.style.overflowWrap = "break-word";
			msgcontent.innerHTML = linkify(msg.content);
			msgtimelbl.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');

			if (msg.forwardedfrom != undefined) {
				let il = document.createElement("div");
				il.style.fontSize = "12px";
				il.innerText = "Forwarded From "
				let fu = document.createElement("b");
				fu.classList.add("loading");
				fu.style.cursor = "pointer";
				fu.innerText = "loading..."
				fu.addEventListener("click",function() {
					viewuginfo(msg.forwardedfrom, "user")
				})
				getinfo(msg.forwardedfrom,function(user) {
					fu.innerText = user.name;
					fu.classList.remove("loading");
				})
				il.appendChild(fu);
				msgbubble.appendChild(il);
			}

			if (msg.replymsgcontent != undefined) {
				let rc = document.createElement("replycont");
				addRipple(rc,"rgba(255,200,0,0.6)");
				rc.addEventListener("click",function() {

				})
				let replysname = document.createElement("b");
				replysname.innerText = "loading...";
				replysname.classList.add("loading");
				getinfo(msg.replymsgsender,function(user) {
					replysname.innerText = user.name;
					replysname.classList.remove("loading");
				})

				rc.appendChild(replysname);
				let replycnt = document.createElement("label");
				replycnt.innerText = msg.replymsgcontent;
				rc.appendChild(replycnt);
				msgbubble.appendChild(rc);
			}



			if (msg.sender != 0) {
				msgm.appendChild(msgsender);
				getinfo(msg.sender,(user) => {
					msgpfp.classList.remove("loading");
					msgsendertxt.classList.remove("loading");
					msgsendertxt.innerText = user.name;
					msgpfp.src = getpfp(user.picture);
					msgpfp.title = user.name;
					senderuser = user;
				})

				msgpfp.style.cursor = "pointer";
				msgpfp.addEventListener("click",function() {
					viewuginfo(msg.sender,"user")
				})
			}
			msgm.appendChild(msgbubble);
			if (msg.files != undefined) {
				msg.gImages.forEach(function(i) {
					let imgs = new Image();
					imgs.src = i.url.replace(/%SERVER%/g,currserver) + (i.url.includes("%SERVER%") ? "&type=thumb" : "");
					let img = document.createElement("img");
					img.style.background = "white";
					if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
						// dark mode
						img.src = "file_dark.svg";
					}else {
						img.src = "file.svg";
					}
					img.classList.add("msgimg");
					img.onclick = function() {
						let a = document.createElement("a");
						a.href = i.url.replace(/%SERVER%/g,currserver);
						a.target = "_blank";
						a.click();
					}
					imgs.onload = function() {
						img.src = imgs.src;
						img.onclick = function() {
							imageView(i.url.replace(/%SERVER%/g,currserver));
						}
					}
					img.style.width = img.style.height = Math.max(240 / msg.gImages.length,64) + "px";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					img.title = filename;
					msgbubble.appendChild(img);
				})
				msg.gVideos.forEach(function(i) {
					let vid = document.createElement("video");
					//vid.muted = true;
					//vid.autoplay = true;
					vid.controls = true;
					vid.src = i.url.replace(/%SERVER%/g,currserver);
					vid.style.aspectRatio = "16/9";
					vid.style.width = "100%";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					vid.title = filename;
					msgbubble.appendChild(vid);
				})
				if (msg.gImages.length > 0) msgbubble.appendChild(document.createElement("br"));
				msg.gFiles.forEach(function(i) {
					let a = document.createElement("a");
					a.style.position = "relative";
					a.download = i.name;
					a.target = "_blank";
					a.href = i.url.replace(/%SERVER%/g,currserver);
					let fd = document.createElement("filed");
					addRipple(a,"rgba(255,255,255,0.6)");
					let img = document.createElement("img");
					if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
						// dark mode
						img.src = "file_dark.svg";
					}else {
						img.src = "file.svg";
					}
					let filename = i.name;
					a.title = filename;
					fd.appendChild(img)
					let il = document.createElement("div");
					il.style.display = "flex";
					il.style.flexDirection = "column";
					let namel = document.createElement("label");
					namel.innerText = filename;
					il.appendChild(namel);
					let sizel = document.createElement("label");
					sizel.innerText = humanFileSize(i.size);
					il.appendChild(sizel);
					fd.appendChild(il);
					a.appendChild(fd)
					msgbubble.appendChild(a);
				})

			}

			msgbubble.appendChild(msgcontent);
			msgbubble.appendChild(msgreactions);

			if (msg.sender != 0) {
				msgm.appendChild(msgtime);
			}

			let msgstatus = null;
			let msgpinned = document.createElement("div");
			msgpinned.title = "Pinned";
			msgpinned.style.display = msg.pinned ? "" : "none";
			msgpinned.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';


			if (msg.sender == logininfo.uid) {
				msgm.classList.add("sender");
				msgc.appendChild(document.createElement("ma"));
				msgsender.appendChild(document.createElement("ma"));
				msgsender.appendChild(msgsendertxt)
				msgtime.appendChild(document.createElement("ma"));
				msgtime.appendChild(msgtimelbl);
				msgstatus = document.createElement("div");
				msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
				msgtime.appendChild(msgstatus);
				msgc.appendChild(msgm);
				msgc.appendChild(msgpfp);
			}else {
				if (msg.sender == 0) {
					msgc.appendChild(document.createElement("ma"));
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
				}else {
					msgc.appendChild(msgpfp);
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
					msgsender.appendChild(msgsendertxt)
					msgsender.appendChild(document.createElement("ma"));
					msgtime.appendChild(msgtimelbl);
					msgtime.appendChild(document.createElement("ma"));
				}
			}
			msgtime.appendChild(msgpinned);

			let reactions = msg.reactions;
			let rdata = {};
			if (reactions) {
				Object.keys(reactions).forEach(function(ir) {
					let react = reactions[ir];
					let reacc = document.createElement("div");
					reacc.style.cursor = "pointer";
					reacc.addEventListener("click",function() {
						fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': id, reaction: ir}),method: 'POST'}).then((res) => {

						})
					})
					let reace = document.createElement("label");
					reace.innerText = ir;
					let cnter = document.createElement("label");
					cnter.innerText = "0";
					reacc.appendChild(reace);
					reacc.appendChild(cnter);
					msgreactions.appendChild(reacc);

					rdata[ir] = {reaction: ir, container: reacc, counter:cnter}

					let rkk = Object.keys(react);
					let doescontaincurr = false;
					Object.keys(react).forEach(function(aa) {
						let a = react[aa];
						if (a.sender == logininfo.uid) {
							doescontaincurr = true;
						}
					})

					if (doescontaincurr) {
						rdata[ir].container.classList.add("rcted")
					}

					rdata[ir].counter.innerText = rkk.length;
				});

			}

			return {message: msgc, status:msgstatus,msgreactions: msgreactions,reactions: rdata, pinned:msgpinned};;
		}

		/*function addmsg(msg,id) {
			let dt = new Date(msg.time);
			let dtt = new Date(msg.time);
			let nowdate = new Date();
			if (dtt.setHours(0,0,0,0) != lastmsgtime.setHours(0,0,0,0)) {
				lastmsgtime = new Date(msg.time);
				addmsg({
					sender:0,
					content: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear(),
					time: dt
				},0)
				lastmsgsender = msg.sender;
			}
			msg.key = id;
			msgs.push(msg);
			messageslist.setList(msgs);
			return {};
		}*/
		
		let msgcdatas = {};
		sendbtn.disabled = true;
		let sendtyping = true;
		msginput.addEventListener("input",function() {
			if (msginput.value.trim().length == 0 && fileslist.length < 1) {
				sendbtn.disabled = true;
			}else {
				sendbtn.disabled = false;
			}
			if (sendtyping) {
				fetch(currserver + "settyping", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'});
				sendtyping = false;
				setTimeout(function() {sendtyping = true},1000);
			}
		})
		
		sendbtn.addEventListener("click",function() {
			let content = msginput.value.trim();
			sendbtn.disabled = true;

			let msg = addmsg({
				sender:logininfo.uid,
				content: content,
				time: new Date()
			},0);
			msg.status.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.376 0-149.188-30Q261-156 208.5-208.5T126-330.958q-30-69.959-30-149.5Q96-560 126-630t82.5-122q52.5-52 122.458-82 69.959-30 149.5-30 79.542 0 149.548 30.24 70.007 30.24 121.792 82.08 51.786 51.84 81.994 121.92T864-480q0 79.376-30 149.188Q804-261 752-208.5T629.869-126Q559.738-96 480-96Zm0-384Zm.477 312q129.477 0 220.5-91.5T792-480.477q0-129.477-91.023-220.5T480.477-792Q351-792 259.5-700.977t-91.5 220.5Q168-351 259.5-259.5T480.477-168Z"/></svg>';

			let files = [];
			let fll = Object.assign([], fileslist);
			function upload() {
				if (fll.length > 0) {
					let file = fll.shift();
					fetch(currserver + "upload", {headers: {'token': logininfo.token,"filename": encodeURI(file.name)},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
						console.log(data);
						if (data.status == "success") {
							files.push(data.url);
							upload();
						}
					})}).catch(function(error) {console.error(error);});
				}else {
					send();
				}
			}
			function send() {
				fetch(currserver + "sendmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'content': content,replymsg: replymsgid,files: (files.length > 0 ? files : null)}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							res = JSON.parse(text);
							if (res.result == "error") {

							}else {
								msg.status.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
							}

							sendedmessages.push(msg.message);
							updatechat();
						})
					}else {
						msgscont.removeChild(msg.message);
					}
				}).catch(() => {
					msgscont.removeChild(msg.message);
				});
			}
			upload();
			fileslist = [];
			atc.innerHTML = "";
			msginput.value = "";
			rc.style.display = "none";
			replymsgid = undefined;
		});
		
		msginput.addEventListener("keydown",function(e) {
			if (e.key == "Enter" && !e.shiftKey) {
				sendbtn.click();
				e.preventDefault();
			}
		})
		
		let isready = true;
		let updatessince = "0";
		fetch(currserver + "getmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'prefix': "#0-#48"}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					isready = true;
					chatpage = JSON.parse(text);
					let mkeys = Object.keys(chatpage);

					mkeys.forEach(i => {
						let msg = chatpage[i];
						addmsg(msg,i);
						updatessince = i;
					})

					messageslist.scrollTop = messageslist.scrollHeight;

					fetch(currserver + "getpinnedmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'}).then((res) => {
						if (res.ok) {
							res.text().then((text) => {
								pinnedmessages = JSON.parse(text);
								updatepinnedbar();
							});
						}
					});
					chatupdatetimer = setInterval(updatechat,1000)
				})
			}else {
				messageslist.innerHTML = "";
				let errorcont = document.createElement("div");
				let errortitle = document.createElement("h3");
				errortitle.innerText = "Couldn't open chat.";
				errorcont.appendChild(errortitle);
				let errormsg = document.createElement("label");
				errormsg.innerText = "Please tell the issue to server's owner if this is not normal.";
				errorcont.appendChild(errormsg);
				messageslist.style.alignItems = "center";
				messageslist.style.justifyContent = "center";
				messageslist.appendChild(errorcont);
				mgb.remove();
				kill();
			}
		})
		let readupdates = [];
		function updatechat() {
			if (!isready) return;
			isready = false;
			let req = {
				"getupdates": JSON.stringify({'token': logininfo.token, 'id': chatid, 'since': updatessince}),
				"gettyping": JSON.stringify({'token': logininfo.token, 'chatid': chatid})
			};
			if (isuserchat) {
				req["getonline"] = JSON.stringify({'token': logininfo.token, 'uid': ugid});
			}
			fetch(currserver + "multi", {body: JSON.stringify(req), method: "POST"}).then((res) => {
				res.json().then((resp) => {
					isready = true;
					{
						let getupdatesrequest = resp["getupdates"];
						if (getupdatesrequest.statuscode == 200) {
							let json = JSON.parse(getupdatesrequest.res);
							let keys = Object.keys(json);
							keys.forEach((i) => {
								updatessince = i;
								let val = json[i];
								let key = val.id;
								if (!readupdates.includes(i)) {
									readupdates.push(key);
									if (val.event == "NEWMESSAGE") {
										if (messageflexes[key] == undefined) {
											chatpage[key] = val;
											let msg = val;
											addmsg(msg,key);
											messageslist.scrollTop = messageslist.scrollHeight;
										}
									}
									if (val.event == "DELETED") {
										if (messageflexes[key]) {
											delete chatpage[key];
											messageflexes[key].remove();
											let index = selectedMessages.indexOf(key);
											if (index >= 0) {
												selectedMessages.splice(index,1);
											}
											if (pinnedmessages[key]) {
												delete pinnedmessages[key];
												updatepinnedbar();
											}
										}
									}
									if (val.event == "REACTIONS") {
										let msgd = msgcdatas[key];
										if (msgd) {
											let reactions = val.rect;
											chatpage[key].reactions = reactions;
											if (pinnedmessages[key]) { //&& pinnedmessages[i].reactions != val.rect
												pinnedmessages[key].reactions = val.rect;
												updatepinnedbar();
											}
											let rkeys = Object.keys(reactions);
											let news = Object.keys(reactions).filter(x => !Object.keys(msgd.reactions).includes(x));
											news.forEach(function(ir) {
												let react = reactions[ir];
												let reacc = document.createElement("div");
												reacc.addEventListener("click",function() {
													fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': key, reaction: ir}),method: 'POST'}).then((res) => {

													})
												})
												let reace = document.createElement("label");
												reace.innerText = ir;
												let cnter = document.createElement("label");
												cnter.innerText = "0";
												reacc.appendChild(reace);
												reacc.appendChild(cnter);
												msgd.msgreactions.appendChild(reacc);

												msgd.reactions[ir] = {reaction: ir, container: reacc, counter:cnter}
											});

											let nurl = [];
											Object.keys(msgd.reactions).forEach((i) => {
												nurl.push(i);
											})

											rkeys.forEach(function(i) {
												let rk = reactions[i];
												let rkk = Object.keys(rk);
												let doescontaincurr = false;
												rkk.forEach(function(aa) {
													let a = rk[aa];
													if (a.sender == logininfo.uid) {
														doescontaincurr = true;
													}
												})
												nurl.splice(nurl.indexOf(i),1)
												if (doescontaincurr == true) {
													msgd.reactions[i].container.classList.add("rcted")
												}else {
													msgd.reactions[i].container.classList.remove("rcted")
												}

												msgd.reactions[i].counter.innerText = rkk.length;
											})
											nurl.forEach((i) => {
												msgd.reactions[i].container.remove();
												delete msgd.reactions[i];
												delete msgd.msgreactions[i];
											})
										}
									}
									if (val.event == "PINNED") {
										if (pinnedmessages[key] == undefined) {
											let msgd = msgcdatas[key];
											msgd.pinned.style.display = "";
											pinnedmessages[key] = val;
											updatepinnedbar();
										}
									}
									if (val.event == "UNPINNED") {
										if (pinnedmessages[key]) {
											let msgd = msgcdatas[key];
											msgd.pinned.style.display = "none";
											delete pinnedmessages[key];
											updatepinnedbar();
										}
									}
								}
							})
							sendedmessages.forEach(function(i) {
								i.remove();
							})
							sendedmessages = [];
						}
					}
					{
						let gettypingrequest = resp["gettyping"];
						if (gettypingrequest.statuscode == 200) {
							let json = JSON.parse(gettypingrequest.res);
							let index = json.indexOf(logininfo.uid);
							if (index >= 0) {
								json.splice(index,1);
							}
							if (json.length == 0) {
								typinglabel.innerText = "Nobody is typing";
								typinglabel.style.opacity = "0";
							}else {
								let usernameslist = [];
								json.forEach(function(i) {
									getinfo(i,function(u) {
										usernameslist.push(u.name);
										if (json.length == usernameslist.length) {
											typinglabel.innerText = usernameslist.join(",") + " is typing...";
											typinglabel.style.opacity = "";
										}
									})
								});
							}
						}
					}
					if (resp["getonline"]) {
						let getonlinerequest = resp["getonline"];
						if (getonlinerequest.statuscode == 200) {
							let text = getonlinerequest.res;
							infotxt.classList.remove("loading");
							if (text == "Online") {
								infotxt.innerText = "Online";
							}else {
								let dt = new Date(text);
								infotxt.innerText = "Last Online: " + dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + ", " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}
						}
					}
 				});
			});
		}

		return {
			chat: mchat,
			titlebar: titlebar,
			pfp: pfpimg,
			titlelabel: titletxt,
			infolabel: infotxt,
			addmsg: addmsg,
			backbutton:backbtn,
			kill: kill
		};
	}
}

if (currserver == "") {
	if (localStorage.getItem("server") == null) {
		openconnectarea();
	}else {
		currserver = localStorage.getItem("server");
		fetch(currserver + "ping").then(function() {
			if (localStorage.getItem("logininfo") == null) {
				openloginarea();
			}else {
				logininfo = JSON.parse(localStorage.getItem("logininfo"));
				loadmainarea();
			}
			
		}).catch(function() {
			openconnectarea(true);
		})
	}
}else {
	fetch(currserver + "ping").then(function() {
		openloginarea();
	}).catch(function() {
		openconnectarea(true);
	})
}
function humanFileSize(bytes, si=false, dp=1) {
 	const thresh = si ? 1000 : 1024;

  	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
  	}

  	const units = si 
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  	let u = -1;
  	const r = 10**dp;

  	do {
		bytes /= thresh;
		++u;
  	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  	return bytes.toFixed(dp) + ' ' + units[u];
}
}

//something I made
function createDynamicList(innertype = "div") {
	let list = [];
	let listelement = document.createElement("div");
	listelement.style.overflow = "auto";
	let innerelement = document.createElement(innertype);
	innerelement.style.overflow = "hidden";
	innerelement.style.width = "100%";
	innerelement.style.position = "relative";
	listelement.appendChild(innerelement);
	let pos = 0;
	listelement.addEventListener("scroll",function() {
		pos = listelement.scrollTop;
		render();
	})

	let itemgenerator = function(list,index) {};
	let getsize = function(list,index) {};

	let esize = 0;

	function setitemgenerator(f) {
		itemgenerator = f;
	}
	function setgetsize(f) {
		getsize = f;
	}
	function setlist(l) {
		list = l;
		esize = calculateFullSize();
		render();
	}

	function calculateFullSize() {
		let size = 0;
		list.forEach(function(i,idx) {
			size += getsize(list,idx);
		});
		return size;
	}

	function render() {
		esize = calculateFullSize();
		innerelement.innerHTML = "";
		innerelement.style.height = esize + "px";
		//console.log(esize);
		let idx = 0;
		let size = 0;
		while (pos >= size + getsize(list,idx)) {
			if (idx > list.length - 1) {
				return;
			}
			size += getsize(list,idx);
			idx++;
		}
		let offset = pos - size;
		//let visibleitemidx = 0;
		while (pos + listelement.clientHeight >= size) {
			if (idx > list.length - 1) {
				return;
			}
			let elem = itemgenerator(list,idx);
			if (elem) {
				innerelement.appendChild(elem);
				elem.style.position = "absolute";
				/*if (visibleitemidx == 0) {
					elem.style.marginTop = size + "px";
				}*/
				elem.style.top = (size) + "px";
			}
			//visibleitemidx++;
			size += getsize(list,idx);
			idx++;
		}
	}

	return {
		element:listelement,
		setList: setlist,
		setItemGenerator: setitemgenerator,
		setGetSize: setgetsize,
		render: render,
		sizeCalc: function() {
			esize = calculateFullSize();
			innerelement.style.height = esize + "px";
			return esize;
		}
	}
}

function createLazyList(elemtype = "div",innertype = "div") {
	let list = [];
	let listelement = document.createElement(elemtype);
	listelement.style.overflow = "auto";

	let itemgenerator = function(list,index,element) {};
	let itemupdater = function(list,index,element) {};
	let getsize = function(list,index) {};


	function setitemgenerator(f) {
		itemgenerator = f;
	}
	function setitemupdater(f) {
		itemupdater = f;
	}
	function setgetsize(f) {
		getsize = f;
	}
	function setlist(l) {
		list = l;
		init();
	}

	function init() {
		elements = {};
		listelement.innerHTML = "";
		list.forEach(function(i,idx) {
			let size = getsize(list,idx);
			let element = document.createElement(innertype);
			element.style.height = size + "px"; //Assumed size, will be removed when element loads.
			listelement.appendChild(element);
			let viewobserver = new IntersectionObserver(onintersection, {root: null, threshold: 0})
			let loaded = false;
			viewobserver.observe(element);
			function onintersection(entries, opts){
				entries.forEach(function (entry) {
					let visible = entry.isIntersecting;
					if (visible) {
						if (loaded == false) {
							viewobserver.unobserve(element);
							element.style.height = "";
							itemgenerator(list, idx, element);
							loaded = true;
							itemupdater(list, idx, element);
						}
					}
				})
			}
		});
	}

	function updateitem(index = -1) {
		if (index > 0) {
			itemupdater(list, index, listelement.children[index]);
		}else {
			list.forEach(function(i,idx) {
				itemupdater(list, idx, listelement.children[idx]);
			});
		}
	}

	return {
		element: listelement,
		setList: setlist,
		setItemGenerator: setitemgenerator,
		setItemUpdater: setitemupdater,
		setGetSize: setgetsize,
		updateItem: updateitem
	}
}

function getpfp(url,fallback = "person.svg") {
	if (url) {
		if (url.trim() == "") {
			return fallback;
		}else {
			return url.replace(/%SERVER%/g,currserver) + (url.includes("%SERVER%") ? "&type=thumb" : "");
		}
	}else {
		return "";
	}
}
