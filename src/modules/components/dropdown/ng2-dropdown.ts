import {
    HostListener,
    Component,
    ContentChild,
    Output,
    EventEmitter,
    Input
} from '@angular/core';

import { Ng2DropdownButton } from '../button/ng2-dropdown-button';
import { Ng2DropdownMenu } from '../menu/ng2-dropdown-menu';
import { DropdownStateService } from '../../services/dropdown-state.service';
import { Ng2MenuItem } from '../menu-item/ng2-menu-item';

@Component({
    selector: 'ng2-dropdown',
    template: `
        <div class="ng2-dropdown-container">
            <ng-content select="ng2-dropdown-button"></ng-content>
            <ng-content select="ng2-dropdown-menu"></ng-content>
        </div>
    `,
    providers: [DropdownStateService]
})
export class Ng2Dropdown {
    // get children components
    @ContentChild(Ng2DropdownButton, { static: true })
    public button!: Ng2DropdownButton;
    @ContentChild(Ng2DropdownMenu, { static: true })
    public menu!: Ng2DropdownMenu;

    @Input() public dynamicUpdate = true;

    // outputs
    @Output() public onItemClicked: EventEmitter<Ng2MenuItem> = new EventEmitter<
        Ng2MenuItem
    >();
    @Output() public onItemSelected: EventEmitter<Ng2MenuItem> = new EventEmitter<
        Ng2MenuItem
    >();
    @Output() public onShow: EventEmitter<Ng2Dropdown> = new EventEmitter<
        Ng2Dropdown
    >();
    @Output() public onHide: EventEmitter<Ng2Dropdown> = new EventEmitter<
        Ng2Dropdown
    >();

    constructor(private state: DropdownStateService) {}

    public ngOnInit() {
        this.state.dropdownState.onItemClicked.subscribe(item => {
            this.onItemClicked.emit(item);

            if (item.preventClose) {
                return;
            }

            this.hide.call(this);
        });

        if (this.button) {
            this.button.onMenuToggled.subscribe(() => {
                this.toggleMenu();
            });
        }

        this.state.dropdownState.onItemSelected.subscribe(item => {
            this.onItemSelected.emit(item);
        });

        this.state.dropdownState.onItemDestroyed.subscribe(
            (item: Ng2MenuItem) => {
                let newSelectedItem: Ng2MenuItem | undefined;
                const items = this.menu.items.toArray();

                if (item !== this.state.dropdownState.selectedItem) {
                    return;
                }

                if (this.menu.focusFirstElement) {
                    newSelectedItem =
                        item === items[0] && items.length > 1
                            ? items[1]
                            : items[0];
                }

                this.state.dropdownState.select(newSelectedItem);
            }
        );
    }

    /**
     * @name toggleMenu
     * @desc toggles menu visibility
     */
    public toggleMenu(position = this.button.getPosition()): void {
        this.state.menuState.isVisible ? this.hide() : this.show(position);
    }

    /**
     * - hides dropdown
     * @name hide
     */
    public hide(): void {
        this.menu.hide();
        this.onHide.emit(this);
    }

    /**
     * - shows dropdown
     * @name show
     * @param position
     */
    public show(position = this.button.getPosition()): void {
        this.menu.show(position, this.dynamicUpdate);
        this.onShow.emit(this);
    }

    /**
     * @name scrollListener
     */
    @HostListener('window:scroll')
    public scrollListener() {
        if (this.button && this.dynamicUpdate) {
            this.menu.updatePosition(this.button.getPosition(), true);
        }
    }
}
