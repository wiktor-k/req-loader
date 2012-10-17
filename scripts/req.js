(function() {

    var Loaders = {
        Script: {
            load: function (name, parentRequire, load, config) {
                var node = document.createElement('script');
                node.type = 'text/javascript';
                node.charset = 'utf-8';
                node.async = true;
                node.src = name;
                node.addEventListener('load', function() { load(); }, false);
                node.addEventListener('error', load.error, false);
                document.head.appendChild(node);
            },
            normalize: function(name, normalize) {
                return normalize(name + ".js");
            }
        }
    };

    function Component(name) {
        this.name = name;
        this.status = Component.Status.NEW;
        this.dependencies = null;
        this.definition = null;
        this.value = null;
    }

    Component.Status = {
        NEW: "new",
        LOADING: "loading",
        DEFINED: "defined",
        LOADED: "loaded",
        INITIALIZED: "initialized"
    };

    Component.prototype.loadAsync = function(successCallback, errorCallback) {
        this.status = Component.Status.LOADING;
        this.onLoadCallback = successCallback;
        this.onErrorCallback = errorCallback;
        this.loader.load(this.loader.normalize(this.name, this.normalize), null, this.createLoadFunction());

    };

    Component.prototype.onLoaded = function(value) {
        if (!value) {
            this.status = Component.Status.LOADED;
            this.onLoadCallback(this);
        } else {
            this.status = Component.Status.INITIALIZED;
            this.value = value;
            this.onLoadCallback(this);
        }
    };

    Component.prototype.onError = function(e) {
        this.status = Component.Status.LOADED;
        this.error = e;
        this.onErrorCallback(this);
    };

    Component.prototype.createLoadFunction = function() {
        var loadFunction = this.onLoaded.bind(this);
        loadFunction.error = this.onError.bind(this);
        return loadFunction;
    };

    Component.prototype.declare = function(dependencies) {
        this.status = Component.Status.INITIALIZED;
        this.value = this.definition.apply(null, dependencies);
        if (typeof this.value === "undefined") {
            throw new Error("Module " + this.name + " definition returned undefined.");
        }
    };

    Component.prototype.toString = function() {
        return "<" + this.name + ">";
    };

    function Registry() {
        this.components = {};
        this.globalStop = false;
        this.root = "";
    }

    Registry.prototype.onError = function(failingComponent) {
        var component;
        this.globalStop = true;
        console.log("Cannot load component: " + failingComponent);

        for (var name in this.components) {
            component = this.components[name];
            if (component.dependencies && (component.dependencies.indexOf(failingComponent.name) > -1 ||
                component.dependencies.some(function(dep) { return dep.indexOf(failingComponent.name + "!") === 0; }))) {
                console.log("Component " + component + " depends on it.");
            }
        }
    };

    Registry.prototype.hasDependenciesLoaded = function(deps) {
        for (var i = 0, dependencyName; dependencyName = deps[i]; i++) {
            if (!this.components[dependencyName].value) {
                return false;
            }
        }
        return true;
    };

    Registry.prototype.getUnfinishedDeps = function(deps) {
        var unloadedDeps = [];
        for (var i = 0, dependencyName; dependencyName = deps[i]; i++) {
            if (!this.components[dependencyName].value) {
                unloadedDeps.push(this.components[dependencyName]);
            }
        }
        return unloadedDeps;
    };

    Registry.prototype.getDependencies = function (deps) {
        var components = this.components;
        return deps.map(function(name) { return components[name].value; });
    };

    Registry.prototype.define = function(name, dependencies, definition) {
        var component = this.components[name];
        component.dependencies = dependencies;
        component.definition = definition;
        component.status = Component.Status.DEFINED;
        for (var i = 0, dependency; dependency = dependencies[i]; i++) {
            this.addComponent(new Component(dependency));
        }
    };

    Registry.prototype.checkDependencies = function () {
        if (this.globalStop) return;
        var component;
        var dependenciesModified = false;
        var loading = false;
        var missing = false;
        for (var name in this.components) {
            component = this.components[name];
            switch(component.status) {
                case Component.Status.NEW:
                    if (typeof component.loader === "string") {
                        if (this.components[component.loader] && this.components[component.loader].value) {
                            component.loader = this.components[component.loader].value;
                            component.loadAsync(this.checkDependencies.bind(this), this.onError.bind(this));
                        } else {
                            if (this.addComponent(new Component(component.loader))) {
                                dependenciesModified = true;
                            }
                        }
                    } else {
                        component.loadAsync(this.checkDependencies.bind(this), this.onError.bind(this));
                    }
                    loading = true;
                    break;
                case Component.Status.LOADING:
                    loading = true;
                    break;
                case Component.Status.LOADED:
                    if (this.hasDependenciesLoaded(component.dependencies)) {
                        var values = this.getDependencies(component.dependencies);
                        component.declare(values);
                        dependenciesModified = true;
                    } else {
                        missing = component;
                    }
            }
        }
        if (dependenciesModified) {
            this.checkDependencies();
        } else {
            if (!loading) {
                if (missing) {
                    if (!this.hasDependenciesLoaded(missing.dependencies)) {
                        this.globalStop = true;
                        console.log("Cannot satisfy dependencies of ",
                            missing.name, ": ",
                            this.getUnfinishedDeps(missing.dependencies).join(", "));
                        console.log("Check for cycles in dependencies or broken paths.");
                    }
                } else {
                    this.onComplete();
                }
            }
        }
    };

    Registry.prototype.normalize = function(name) {
        return this.root + name;
    };

    Registry.prototype.addComponent = function(component) {
        if (!(component.name in this.components)) {
            if (component.name.indexOf('!') > -1) {
                component.loader = component.name.substring(0, component.name.indexOf('!'));
            } else {
                component.loader = Loaders.Script;
            }
            component.normalize = this.normalize.bind(this);
            this.components[component.name] = component;
            return component;
        }
        return false;
    };

    var registry = new Registry();

    var oldDefine = window.define;
    window.define = registry.define.bind(registry);
    registry.onComplete = function onComplete() {
        window.define = oldDefine;
    };

    var mainPath = document.querySelector("script[data-main]").getAttribute("data-main");

    var mainName = mainPath;

    if (mainPath.indexOf("/") > -1) {
        registry.root = mainPath.substring(0, mainPath.indexOf("/") + 1);
        mainName = mainPath.substring(mainPath.indexOf("/") + 1)
    }

    registry.addComponent(new Component(mainName))
    registry.checkDependencies();

    // for debugging
    window.registry = registry;
})();
