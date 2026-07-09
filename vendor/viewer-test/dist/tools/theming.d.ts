type ThemeSpec = {
    [key: string]: string | string[] | ThemeSpec;
};
type DeepMutable<T> = T extends object ? {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
} : T extends readonly string[] ? string[] : T;
type Theme<S extends ThemeSpec> = {
    -readonly [K in keyof S]?: S[K] extends string ? string : S[K] extends string[] ? string : S[K] extends ThemeSpec ? Theme<DeepMutable<S[K]>> : never;
};

declare const viewerThemeSpec: {
    readonly font: {
        readonly family: "Roboto";
    };
    readonly button: {
        readonly size: "40px";
        readonly bgColor: "#ffffff";
        readonly fgColor: "#494949";
        readonly icon: {
            readonly size: "22px";
            readonly color: "#1a1a1a";
        };
        readonly label: {
            readonly fgColor: ["button/fgColor", "#000000"];
        };
        readonly active: {
            readonly bgColor: ["button/bgColor", "#f2f2f2"];
            readonly fgColor: ["button/fgColor", "#494949"];
            readonly icon: {
                readonly color: ["button/icon/color", "#1a1a1a"];
            };
        };
        readonly focus: {
            readonly outline: "2px solid #999999";
            readonly outlineOffset: "-2px";
        };
    };
    readonly inlineButton: {
        readonly height: "24px";
        readonly borderRadius: "22px";
        readonly fgColor: "#000000";
        readonly bgColor: "#ffffff";
        readonly shadow: "none";
        readonly borderColor: "#cccccc";
        readonly disabled: {
            readonly fgColor: ["inlineButton/fgColor", "#808080"];
            readonly bgColor: ["inlineButton/bgColor", "#ffffff"];
            readonly shadow: ["inlineButton/shadow", "none"];
            readonly borderColor: ["inlineButton/borderColor", "#e5e5e5"];
        };
        readonly hover: {
            readonly fgColor: ["inlineButton/fgColor", "#000000"];
            readonly bgColor: ["inlineButton/bgColor", "#f2f2f2"];
            readonly shadow: ["inlineButton/shadow", string];
            readonly borderColor: ["inlineButton/borderColor", "#f2f2f2"];
        };
        readonly danger: {
            readonly fgColor: ["inlineButton/fgColor", "#ffffff"];
            readonly bgColor: ["inlineButton/bgColor", "#e15d35"];
            readonly shadow: ["inlineButton/shadow", "none"];
            readonly borderColor: ["inlineButton/borderColor", "#e15d35"];
            readonly disabled: {
                readonly fgColor: ["inlineButton/danger/fgColor", "#ffffff"];
                readonly bgColor: ["inlineButton/danger/bgColor", "#f5c6b8"];
                readonly shadow: ["inlineButton/danger/shadow", "none"];
                readonly borderColor: ["inlineButton/danger/borderColor", "#f5c6b8"];
            };
            readonly hover: {
                readonly fgColor: ["inlineButton/danger/fgColor", "#ffffff"];
                readonly bgColor: ["inlineButton/danger/bgColor", "#b23712"];
                readonly shadow: ["inlineButton/danger/shadow", string];
                readonly borderColor: ["inlineButton/danger/borderColor", "#b23712"];
            };
        };
    };
    readonly slider: {
        readonly thumb: {
            readonly size: "12px";
            readonly fgColor: "#ffffff";
            readonly bgColor: "#4b61f9";
        };
        readonly track: {
            readonly width: "80px";
            readonly height: "3px";
            readonly radius: "4px";
            readonly fgColor: "#4b61f9";
            readonly bgColor: "#e5e5e5";
        };
        readonly disabled: {
            readonly thumb: {
                readonly fgColor: "#ffffff";
                readonly bgColor: "#7d7d93";
            };
            readonly track: {
                readonly fgColor: "#7d7d93";
                readonly bgColor: "#e5e5e5";
            };
        };
        readonly focus: {
            readonly thumb: {
                readonly shadow: string;
            };
        };
    };
    readonly dropdown: {
        readonly fgColor: "#000000";
        readonly bgColor: "#ffffff";
        readonly borderColor: "#cccccc";
        readonly icon: {
            readonly color: ["dropdown/fgColor", "#1a1a1a"];
        };
        readonly content: {
            readonly fgColor: ["dropdown/fgColor", "#000000"];
            readonly bgColor: ["dropdown/bgColor", "#ffffff"];
            readonly shadow: string;
            readonly borderColor: "#e5e5e5";
        };
        readonly focus: {
            readonly outline: "2px solid #999999";
            readonly outlineOffset: "2px";
        };
        readonly item: {
            readonly highlighted: {
                readonly fgColor: ["dropdown/content/fgColor", "inherit"];
                readonly bgColor: ["dropdown/content/bgColor", "#f2f2f2"];
            };
            readonly selected: {
                readonly fgColor: ["dropdown/fgColor", "inherit"];
                readonly bgColor: ["dropdown/bgColor", "inherit"];
                readonly iconColor: "#4b61f9";
                readonly highlighted: {
                    readonly fgColor: ["dropdown/item/selected/fgColor", "dropdown/item/highlighted/fgColor", "inherit"];
                    readonly bgColor: ["dropdown/item/selected/bgColor", "dropdown/item/highlighted/bgColor", "#f2f2f2"];
                    readonly iconColor: "#4b61f9";
                };
            };
        };
    };
    readonly spinner: {
        readonly fgColor: "#4b61f9";
        readonly bgColor: "#cccccc";
    };
    readonly modal: {
        readonly fgColor: "#000000";
        readonly bgColor: "#ffffff";
        readonly overlay: {
            readonly color: "#000000B3";
        };
        readonly closeIcon: {
            readonly color: ["modal/fgColor", "#000000"];
        };
    };
    readonly qrModal: {
        readonly header: {
            readonly fgColor: ["modal/fgColor", "#494949"];
        };
        readonly text: {
            readonly fgColor: ["modal/fgColor", "#757575"];
        };
    };
    readonly infoModal: {
        readonly fgColor: ["modal/fgColor", "#000000"];
        readonly bgColor: ["modal/bgColor", "#ffffff"];
        readonly borderColor: "#e5e5e5";
        readonly accentColor: "#4b61f9";
        readonly tabs: {
            readonly fgColor: ["infoModal/fgColor", "modal/fgColor", "#000000"];
            readonly bgColor: ["infoModal/bgColor", "modal/bgColor", "#ffffff"];
            readonly borderColor: "#e5e5e5";
            readonly button: {
                readonly fgColor: ["modal/fgColor", "#000000"];
                readonly bgColor: ["modal/bgColor", "#ffffff"];
                readonly selected: {
                    readonly fgColor: ["infoModal/fgColor", "#ffffff"];
                    readonly bgColor: ["infoModal/bgColor", "#4b61f9"];
                };
            };
        };
        readonly items: {
            readonly fontSize: "12px";
        };
    };
    readonly window: {
        readonly fgColor: ["modal/fgColor", "#000000"];
        readonly bgColor: ["modal/bgColor", "#ffffff"];
        readonly header: {
            readonly fgColor: "inherit";
            readonly bgColor: "inherit";
        };
        readonly footer: {
            readonly fgColor: "inherit";
            readonly bgColor: "inherit";
        };
        readonly chrome: {
            readonly border: {
                readonly color: "#cccccc";
            };
        };
        readonly shadow: {
            readonly color: "#00000026";
        };
        readonly closeIcon: {
            readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
        };
        readonly resizeIcon: {
            readonly color: ["window/fgColor", "modal/fgColor", "#808080"];
        };
    };
    readonly sceneGraph: {
        readonly search: {
            readonly fgColor: "inherit";
            readonly bgColor: "inherit";
            readonly placeholder: {
                readonly fgColor: "#757575";
            };
            readonly icon: {
                readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
            };
            readonly closeIcon: {
                readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
            };
            readonly text: {
                readonly color: "inherit";
            };
            readonly item: {
                readonly fgColor: ["sceneGraph/item/active/fgColor", "inherit"];
                readonly bgColor: ["sceneGraph/item/active/bgColor", "inherit"];
                readonly hover: {
                    readonly fgColor: ["sceneGraph/item/active/hover/fgColor", "inherit"];
                    readonly bgColor: ["sceneGraph/item/active/hover/bgColor", "#f2f2f2"];
                };
                readonly path: {
                    readonly fgColor: ["window/fgColor", "modal/fgColor", "#808080"];
                };
            };
        };
        readonly item: {
            readonly icon: {
                readonly size: "18px";
            };
            readonly marker: {
                readonly size: "20px";
                readonly gap: "3px";
                readonly color: "inherit";
            };
            readonly active: {
                readonly fgColor: "inherit";
                readonly bgColor: "inherit";
                readonly hover: {
                    readonly fgColor: "inherit";
                    readonly bgColor: "#f2f2f2";
                };
            };
            readonly inactive: {
                readonly fgColor: "#bfbfbf";
                readonly bgColor: "inherit";
                readonly hover: {
                    readonly fgColor: "inherit";
                    readonly bgColor: "#f2f2f2";
                };
            };
            readonly highlighted: {
                readonly fgColor: "#4b61f9";
                readonly bgColor: "inherit";
                readonly hover: {
                    readonly fgColor: "inherit";
                    readonly bgColor: "#f2f2f2";
                };
            };
        };
    };
};
type ViewerTheme = Theme<typeof viewerThemeSpec>;

declare const sonyViewerTheme: ViewerTheme;
declare const vendorThemes: {
    readonly sony: Theme<{
        readonly font: {
            readonly family: "Roboto";
        };
        readonly button: {
            readonly size: "40px";
            readonly bgColor: "#ffffff";
            readonly fgColor: "#494949";
            readonly icon: {
                readonly size: "22px";
                readonly color: "#1a1a1a";
            };
            readonly label: {
                readonly fgColor: ["button/fgColor", "#000000"];
            };
            readonly active: {
                readonly bgColor: ["button/bgColor", "#f2f2f2"];
                readonly fgColor: ["button/fgColor", "#494949"];
                readonly icon: {
                    readonly color: ["button/icon/color", "#1a1a1a"];
                };
            };
            readonly focus: {
                readonly outline: "2px solid #999999";
                readonly outlineOffset: "-2px";
            };
        };
        readonly inlineButton: {
            readonly height: "24px";
            readonly borderRadius: "22px";
            readonly fgColor: "#000000";
            readonly bgColor: "#ffffff";
            readonly shadow: "none";
            readonly borderColor: "#cccccc";
            readonly disabled: {
                readonly fgColor: ["inlineButton/fgColor", "#808080"];
                readonly bgColor: ["inlineButton/bgColor", "#ffffff"];
                readonly shadow: ["inlineButton/shadow", "none"];
                readonly borderColor: ["inlineButton/borderColor", "#e5e5e5"];
            };
            readonly hover: {
                readonly fgColor: ["inlineButton/fgColor", "#000000"];
                readonly bgColor: ["inlineButton/bgColor", "#f2f2f2"];
                readonly shadow: ["inlineButton/shadow", string];
                readonly borderColor: ["inlineButton/borderColor", "#f2f2f2"];
            };
            readonly danger: {
                readonly fgColor: ["inlineButton/fgColor", "#ffffff"];
                readonly bgColor: ["inlineButton/bgColor", "#e15d35"];
                readonly shadow: ["inlineButton/shadow", "none"];
                readonly borderColor: ["inlineButton/borderColor", "#e15d35"];
                readonly disabled: {
                    readonly fgColor: ["inlineButton/danger/fgColor", "#ffffff"];
                    readonly bgColor: ["inlineButton/danger/bgColor", "#f5c6b8"];
                    readonly shadow: ["inlineButton/danger/shadow", "none"];
                    readonly borderColor: ["inlineButton/danger/borderColor", "#f5c6b8"];
                };
                readonly hover: {
                    readonly fgColor: ["inlineButton/danger/fgColor", "#ffffff"];
                    readonly bgColor: ["inlineButton/danger/bgColor", "#b23712"];
                    readonly shadow: ["inlineButton/danger/shadow", string];
                    readonly borderColor: ["inlineButton/danger/borderColor", "#b23712"];
                };
            };
        };
        readonly slider: {
            readonly thumb: {
                readonly size: "12px";
                readonly fgColor: "#ffffff";
                readonly bgColor: "#4b61f9";
            };
            readonly track: {
                readonly width: "80px";
                readonly height: "3px";
                readonly radius: "4px";
                readonly fgColor: "#4b61f9";
                readonly bgColor: "#e5e5e5";
            };
            readonly disabled: {
                readonly thumb: {
                    readonly fgColor: "#ffffff";
                    readonly bgColor: "#7d7d93";
                };
                readonly track: {
                    readonly fgColor: "#7d7d93";
                    readonly bgColor: "#e5e5e5";
                };
            };
            readonly focus: {
                readonly thumb: {
                    readonly shadow: string;
                };
            };
        };
        readonly dropdown: {
            readonly fgColor: "#000000";
            readonly bgColor: "#ffffff";
            readonly borderColor: "#cccccc";
            readonly icon: {
                readonly color: ["dropdown/fgColor", "#1a1a1a"];
            };
            readonly content: {
                readonly fgColor: ["dropdown/fgColor", "#000000"];
                readonly bgColor: ["dropdown/bgColor", "#ffffff"];
                readonly shadow: string;
                readonly borderColor: "#e5e5e5";
            };
            readonly focus: {
                readonly outline: "2px solid #999999";
                readonly outlineOffset: "2px";
            };
            readonly item: {
                readonly highlighted: {
                    readonly fgColor: ["dropdown/content/fgColor", "inherit"];
                    readonly bgColor: ["dropdown/content/bgColor", "#f2f2f2"];
                };
                readonly selected: {
                    readonly fgColor: ["dropdown/fgColor", "inherit"];
                    readonly bgColor: ["dropdown/bgColor", "inherit"];
                    readonly iconColor: "#4b61f9";
                    readonly highlighted: {
                        readonly fgColor: ["dropdown/item/selected/fgColor", "dropdown/item/highlighted/fgColor", "inherit"];
                        readonly bgColor: ["dropdown/item/selected/bgColor", "dropdown/item/highlighted/bgColor", "#f2f2f2"];
                        readonly iconColor: "#4b61f9";
                    };
                };
            };
        };
        readonly spinner: {
            readonly fgColor: "#4b61f9";
            readonly bgColor: "#cccccc";
        };
        readonly modal: {
            readonly fgColor: "#000000";
            readonly bgColor: "#ffffff";
            readonly overlay: {
                readonly color: "#000000B3";
            };
            readonly closeIcon: {
                readonly color: ["modal/fgColor", "#000000"];
            };
        };
        readonly qrModal: {
            readonly header: {
                readonly fgColor: ["modal/fgColor", "#494949"];
            };
            readonly text: {
                readonly fgColor: ["modal/fgColor", "#757575"];
            };
        };
        readonly infoModal: {
            readonly fgColor: ["modal/fgColor", "#000000"];
            readonly bgColor: ["modal/bgColor", "#ffffff"];
            readonly borderColor: "#e5e5e5";
            readonly accentColor: "#4b61f9";
            readonly tabs: {
                readonly fgColor: ["infoModal/fgColor", "modal/fgColor", "#000000"];
                readonly bgColor: ["infoModal/bgColor", "modal/bgColor", "#ffffff"];
                readonly borderColor: "#e5e5e5";
                readonly button: {
                    readonly fgColor: ["modal/fgColor", "#000000"];
                    readonly bgColor: ["modal/bgColor", "#ffffff"];
                    readonly selected: {
                        readonly fgColor: ["infoModal/fgColor", "#ffffff"];
                        readonly bgColor: ["infoModal/bgColor", "#4b61f9"];
                    };
                };
            };
            readonly items: {
                readonly fontSize: "12px";
            };
        };
        readonly window: {
            readonly fgColor: ["modal/fgColor", "#000000"];
            readonly bgColor: ["modal/bgColor", "#ffffff"];
            readonly header: {
                readonly fgColor: "inherit";
                readonly bgColor: "inherit";
            };
            readonly footer: {
                readonly fgColor: "inherit";
                readonly bgColor: "inherit";
            };
            readonly chrome: {
                readonly border: {
                    readonly color: "#cccccc";
                };
            };
            readonly shadow: {
                readonly color: "#00000026";
            };
            readonly closeIcon: {
                readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
            };
            readonly resizeIcon: {
                readonly color: ["window/fgColor", "modal/fgColor", "#808080"];
            };
        };
        readonly sceneGraph: {
            readonly search: {
                readonly fgColor: "inherit";
                readonly bgColor: "inherit";
                readonly placeholder: {
                    readonly fgColor: "#757575";
                };
                readonly icon: {
                    readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
                };
                readonly closeIcon: {
                    readonly color: ["window/fgColor", "modal/fgColor", "#1a1a1a"];
                };
                readonly text: {
                    readonly color: "inherit";
                };
                readonly item: {
                    readonly fgColor: ["sceneGraph/item/active/fgColor", "inherit"];
                    readonly bgColor: ["sceneGraph/item/active/bgColor", "inherit"];
                    readonly hover: {
                        readonly fgColor: ["sceneGraph/item/active/hover/fgColor", "inherit"];
                        readonly bgColor: ["sceneGraph/item/active/hover/bgColor", "#f2f2f2"];
                    };
                    readonly path: {
                        readonly fgColor: ["window/fgColor", "modal/fgColor", "#808080"];
                    };
                };
            };
            readonly item: {
                readonly icon: {
                    readonly size: "18px";
                };
                readonly marker: {
                    readonly size: "20px";
                    readonly gap: "3px";
                    readonly color: "inherit";
                };
                readonly active: {
                    readonly fgColor: "inherit";
                    readonly bgColor: "inherit";
                    readonly hover: {
                        readonly fgColor: "inherit";
                        readonly bgColor: "#f2f2f2";
                    };
                };
                readonly inactive: {
                    readonly fgColor: "#bfbfbf";
                    readonly bgColor: "inherit";
                    readonly hover: {
                        readonly fgColor: "inherit";
                        readonly bgColor: "#f2f2f2";
                    };
                };
                readonly highlighted: {
                    readonly fgColor: "#4b61f9";
                    readonly bgColor: "inherit";
                    readonly hover: {
                        readonly fgColor: "inherit";
                        readonly bgColor: "#f2f2f2";
                    };
                };
            };
        };
    }>;
};
declare function generateViewerTheme(vendor: string): string;

export { generateViewerTheme, sonyViewerTheme, vendorThemes };
