webix.protoUI({
    name: "textarea0",
    $cssName: "textarea",
    getValue: function () {
        var rv = webix.ui.textarea.prototype.getValue.call(this);
        return rv.split('\n');
    },
    setValue: function (value) {
        webix.ui.textarea.prototype.setValue.call(this, value.join('\n'));
    }
}, webix.ui.textarea);

webix.protoUI({
    _log_popup: webix.ui({
        view: 'popup',
        id: 'log',
        minHeight: 320,
        height: 640,
        minWidth: 320,
        width: 480,
        body: {
            rows: [
                {
                    view: 'Logger',
                    id: 'main-log',
                    ejs: 'views/main_log_item.ejs'
                }
            ]
        },
        on: {
            onHide: function () {
                $$('main-toolbar').switchLogBtnIcon('');
            }
        }
    }),
    _help_popup: webix.ui({
        view: "popup",
        zIndex: 1,
        toFront: true,
        position: "center",
        autoheight: true,
        minHeight: 480,
        minWidth: 320,
        body: {
            rows: [
                {
                    margin: 5,
                    template: new View({url: "views/help.ejs"}).render()
                }
            ]
        }
    }),
    _wizard_window: webix.ui({
        view: "window",
        zIndex: 1,
        toFront: true,
        position: "center",
        autofocus: true,
        autoheight: true,
        minwidth: 320,
        close: true,
        move: true,
        headHeight: 20,
        head: {template: "New server wizard"},
        body: {
            rows: [
                {
                    view: "form",
                    id: "frmServerWizard",
                    elements: [
                        {
                            view: "text",
                            name: "server",
                            label: "ServerName/Instance:",
                            labelWidth: 150,
                            labelPosition: "top",
                            placeholder: "server/instance, i.e. TangoTest/test",
                            validate: function (value) {
                                return /^[\w]*\/[\w]*$/.test(value);
                            }, invalidMessage: "Incorrect server/instance"
                        },
                        {
                            view: "text",
                            name: "className",
                            label: "Class name:",
                            labelWidth: 150,
                            labelPosition: "top",
                            placeholder: "MyClass",
                            validate: webix.rules.isNotEmpty,
                            invalidMessage: "Can not be empty"
                        },
                        {
                            view: "textarea0",
                            name: "devices",
                            label: "Devices:",
                            height: 200,
                            labelWidth: 150,
                            labelPosition: "top",
                            placeholder: "instance/family/member, i.e. sys/tg_test/1",
                            validate: function (value) {
                                var rv = false;
                                do {
                                    rv = /[\w]*\/[\w]*\/[\w]*/.test(value.shift());
                                } while (rv && value.length != 0);
                                return rv;
                            }, invalidMessage: "Incorrect devices"
                        }
                    ]
                },
                {
                    view: "toolbar", cols: [
                    {},
                    {
                        view: "button", value: "Apply", width: 100, align: "center", click: function () {
                        var $$serverWizard = $$('frmServerWizard');
                        if ($$serverWizard.validate()) {
                            TangoWebapp.helpers.serverWizard($$serverWizard.getValues());
                            this.getTopParentView().hide();
                        }
                    }
                    },
                    {
                        view: "button", value: "Close", width: 100, align: "right", click: function () {
                        this.getTopParentView().hide()
                    }
                    }]
                }
            ]
        }
    }),
    switchLogBtnIcon: function (type) {
        var $$btnLog = this.$$("btnLog");
        if (type === 'error') {
            $$btnLog.config.icon = "bolt";
            $$btnLog.refresh();
            $$btnLog.$view.getElementsByTagName("button")[0].style.background = 'lightcoral';
        } else {
            $$btnLog.config.icon = "eye";
            $$btnLog.refresh();
            $$btnLog.$view.getElementsByTagName("button")[0].style.background = '';
        }
    },
    addTangoHost: function(){
        var top = this.getTopParentView();

        var tango_host = top.$$('txtTangoHost').getValue();
        //TODO validate
        var found = TangoHost.find_one(TangoHost.hashCode(tango_host));
        if(found) {
            TangoWebapp.globals.tango_host = found;
        } else {
            TangoWebapp.globals.tango_host = new TangoHost({
                host: tango_host.split(':')[0],
                port: parseInt(tango_host.split(':')[1])
            });
        }

        TangoWebapp.globals.rest_api_host.addDb(TangoWebapp.globals.tango_host);

        $$('device_tree').updateRoot();
    },
    refresh: function () {
        var top = this.getTopParentView();

        var host = top.$$('txtTangoRestApiHost').getValue();
        var port = top.$$('txtTangoRestApiPort').getValue();
        var version = top.$$('txtTangoRestApiVersion').getValue();

        //TODO validate
        TangoWebapp.globals.rest_api_host = new RestApiHost(
            {
                host: host,
                port: parseInt(port),
                version: version
            }
        );


        $$('device_tree').updateRoot();
    },
    wizard: function () {
        var top = this.getTopParentView();

        top._wizard_window.show();
    },
    help: function () {
        var top = this.getTopParentView();
        top._help_popup.show();
    },
    _getUI: function () {
        var top = this;
        var versionLabel = "app.ver.: " + TangoWebapp.version;
        return {
            cols: [
                {
                    view: "label",
                    label: "TANGO_REST:",
                    width: 120
                },
                {
                    view: "text",
                    id: "txtTangoRestApiHost",
                    value: TangoWebapp.consts.REST_API_HOST,
                    width: 100
                },
                {
                    view: "text",
                    id: "txtTangoRestApiPort",
                    value: TangoWebapp.consts.REST_API_PORT,
                    width: 80
                },
                {
                    view: "text",
                    id: "txtTangoRestApiVersion",
                    value: TangoWebapp.consts.REST_API_VERSION,
                    disabled: true, //TODO different versions support
                    width: 50
                },
                {view: "button", id: "btnRefresh", type: "iconButton", icon: "refresh", width: 36, click: top.refresh},
                {},
                {
                    view: "label",
                    label: "TANGO_HOST =",
                    width: 120
                },
                {
                    view: "text",
                    id: "txtTangoHost",
                    value: TangoWebapp.globals.tango_host.toString(),
                    width: 150
                },
                {view: "button", id: "btnAdd", type: "iconButton", icon: "plus", width: 36, click: top.addTangoHost},
                {
                    view: "button",
                    id: "btnAddWizard",
                    label: "Add server wizard",
                    type: "iconButton",
                    icon: "magic",
                    width: 180,
                    click: top.wizard
                },
                {},
                {view: "label", label: versionLabel, align: "right", width: 260},
                {
                    view: "button",
                    id: "btnHelp",
                    type: "iconButton",
                    icon: "question",
                    width: 36,
                    click: top.help,
                    align: "right"
                },
                {
                    view: "button",
                    id: "btnLog",
                    type: "iconButton",
                    icon: "eye",
                    width: 36,
                    popup: 'log',
                    align: "right"
                }
            ]
        }
    },
    changeTangoHost: function () {
        TangoWebapp.helpers.changeTangoHost();
    },
    name: "MainToolbar",
    $init: function (config) {
        webix.extend(config, this._getUI());
    },
    defaults: {
        height: 40
    }
}, webix.IdSpace, webix.EventSystem, webix.ui.toolbar);


TangoWebapp.ui.newMainToolbar = function () {
    return {
        view: "MainToolbar",
        id: "main-toolbar"
    }
};