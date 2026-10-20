/**
 * Stripe Tax for WooCommerce admin scripts.
 *
 * Handles admin page interactions for settings, order item updates, and key actions.
 *
 * @package StripeTaxForWooCommerce
 */

jQuery( document ).ready(
	function ($) {
		var $test_connection_button         = $( '.js_stripe_tax_for_woocommerce_button_test_connection' );
		var $tax_settings_city_input        = $( '#stripe_tax_for_woocommerce_id_live_mode_city' );
		var $tax_settings_country_select    = $( '#stripe_tax_for_woocommerce_id_live_mode_country' );
		var $tax_settings_postal_code_input = $( '#stripe_tax_for_woocommerce_id_live_mode_postal_code' );
		var $tax_state_row                  = $( '.stripe_tax_for_woocommerce_state_row' );
		var $tax_city_row                   = $( '.stripe_tax_for_woocommerce_city_row' );
		var $tax_city_label                 = $( '.stripe_tax_for_woocommerce_city_label' );
		var $tax_postal_code_row            = $( '.stripe_tax_for_woocommerce_postal_code_row' );
		var $tax_postal_code_label          = $( '.stripe_tax_for_woocommerce_postal_code_label' );

		function handle_tax_settings_country_change() {
			var $this   = $( this );
			var country = $this.val();
			var city_label;
			var postal_code_label;

			$tax_state_row.addClass( 'stripe_tax_for_woocommerce_hidden' );
			$( '.stripe_tax_for_woocommerce_state_row_' + country ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
			$tax_city_row.removeClass( 'stripe_tax_for_woocommerce_hidden' );
			$tax_postal_code_row.removeClass( 'stripe_tax_for_woocommerce_hidden' );

			if (stripe_tax_for_woocommerce.city_is_district_countries.includes( country )) {
				city_label = stripe_tax_for_woocommerce.city_is_district_label;
			} else if (stripe_tax_for_woocommerce.city_is_town_or_city_countries.includes( country )) {
				city_label = stripe_tax_for_woocommerce.city_is_town_or_city_label;
			} else {
				city_label = stripe_tax_for_woocommerce.city_label;
			}
			$tax_city_label.text( city_label );
			$tax_settings_city_input.attr( 'placeholder', city_label );

			if (stripe_tax_for_woocommerce.postal_code_is_eircode_countries.includes( country )) {
				postal_code_label = stripe_tax_for_woocommerce.postal_code_is_eircode_label;
			} else if (stripe_tax_for_woocommerce.postal_code_is_zip_countries.includes( country )) {
				postal_code_label = stripe_tax_for_woocommerce.postal_code_is_zip_label;
			} else {
				postal_code_label = stripe_tax_for_woocommerce.postal_code_label;
			}
			$tax_postal_code_label.html( postal_code_label );
			$tax_settings_postal_code_input.attr( 'placeholder', postal_code_label );

			if (stripe_tax_for_woocommerce.postal_code_no_city_countries.includes( country )) {
				$tax_city_row.addClass( 'stripe_tax_for_woocommerce_hidden' );
			}

			if (stripe_tax_for_woocommerce.postal_code_no_postal_code_countries.includes( country )) {
				$tax_postal_code_row.addClass( 'stripe_tax_for_woocommerce_hidden' );
			}
		}

		$tax_settings_country_select.change( handle_tax_settings_country_change );

		var $tax_registrations_country  = $( '#stripe_tax_for_woocommerce_id_tax_registration_country' );
		var $tax_registrations_us_state = $( '#stripe_tax_for_woocommerce_id_tax_registration_us_state' );
		var $tax_registration_rows      = $( '.stripe_tax_for_woocommerce_tax_registration_row' );

		var $tax_registration_input_type          = $( '.stripe_tax_for_woocommerce_tax_registration_input_type' );
		var $tax_registration_type_standard       = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_standard' );
		var $tax_registration_type_oss_union      = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_oss_union' );
		var $tax_registration_type_oss_non_union  = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_oss_non_union' );
		var $tax_registration_type_ioss           = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_ioss' );
		var $tax_registration_type_bc             = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_bc' );
		var $tax_registration_type_mb             = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_mb' );
		var $tax_registration_type_sk             = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_sk' );
		var $tax_registration_type_qc             = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_qc' );
		var $tax_registration_type_lease_tax      = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_lease_tax' );
		var $tax_registration_type_chicago        = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_chicago' );
		var $tax_registration_type_bloomington    = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_bloomington' );
		var $tax_registration_type_east_dundee    = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_east_dundee' );
		var $tax_registration_type_schiller_park  = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_schiller_park' );
		var $tax_registration_type_evanston       = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_evanston' );
		var $tax_registration_type_communications = $( '#stripe_tax_for_woocommerce_id_tax_registration_type_us_state_communications' );

		function make_lock($object) {
			$object.attr( 'disabled', 'disabled' );
			$object.prop( 'checked', true );
		}

		function handle_tax_registration_country_or_us_state_change() {
			var country               = $tax_registrations_country.val();
			var country_selected_text = $( '#stripe_tax_for_woocommerce_id_tax_registration_country option:selected' ).text();
			var state                 = $tax_registrations_us_state.val();
			var state_selected_text   = $( '#stripe_tax_for_woocommerce_id_tax_registration_us_state option:selected' ).text();

			$( '.tax_registrations_localize_domestic' ).text( stripe_tax_for_woocommerce.tax_registrations_localize_domestic.replace( '%s', country_selected_text ) );
			$( '.tax_registrations_localize_domestic_description' ).text( stripe_tax_for_woocommerce.tax_registrations_localize_domestic_description.replace( '%s', country_selected_text ) );
			$( '.tax_registrations_localize_local_communications' ).text( stripe_tax_for_woocommerce.tax_registrations_localize_local_communications.replace( '%s', state_selected_text ) );
			$( '.tax_registrations_localize_local_communications_description' ).text( stripe_tax_for_woocommerce.tax_registrations_localize_local_communications_description.replace( '%s', state_selected_text ) );
			$( '.tax_registrations_localize_no_sales_description' ).text( stripe_tax_for_woocommerce.tax_registrations_localize_no_sales_description.replace( '%s', state_selected_text ) );

			$tax_registration_input_type.removeAttr( 'disabled' );
			$tax_registration_input_type.prop( 'checked', false );

			var locks = stripe_tax_for_woocommerce.tax_registrations_locks;
			if (locks['countries'].includes( country )) {
				make_lock( $tax_registration_type_standard );
			}
			if (locks['oss_union']) {
				make_lock( $tax_registration_type_oss_union );
			}
			if (locks['oss_non_union']) {
				make_lock( $tax_registration_type_oss_non_union );
			}
			if (locks['ioss']) {
				make_lock( $tax_registration_type_ioss );
			}
			if (country === 'CA') {
				if (locks['ca_provinces'].includes( 'BC' )) {
					make_lock( $tax_registration_type_bc );
				}
				if (locks['ca_provinces'].includes( 'MB' )) {
					make_lock( $tax_registration_type_mb );
				}
				if (locks['ca_provinces'].includes( 'SK' )) {
					make_lock( $tax_registration_type_sk );
				}
				if (locks['ca_provinces'].includes( 'QC' )) {
					make_lock( $tax_registration_type_qc );
				}
			}

			if (country === 'US') {
				if (locks['local_communications'].includes( state )) {
					make_lock( $tax_registration_type_communications );
				}
				if (locks['chicago_lease'].includes( state )) {
					make_lock( $tax_registration_type_lease_tax );
				}
				if (locks['chicago_amusement'].includes( state )) {
					make_lock( $tax_registration_type_chicago );
				}
				if (locks['bloomington'].includes( state )) {
					make_lock( $tax_registration_type_bloomington );
				}
				if (locks['east_dundee'].includes( state )) {
					make_lock( $tax_registration_type_east_dundee );
				}
				if (locks['evanston'].includes( state )) {
					make_lock( $tax_registration_type_evanston );
				}
				if (locks['schiller_park'].includes( state )) {
					make_lock( $tax_registration_type_schiller_park );
				}

			}

			$tax_registration_rows.addClass( 'stripe_tax_for_woocommerce_hidden' );
			if (country === 'US') {
				$( '.stripe_tax_for_woocommerce_tax_registration_row_us_state' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
				if (stripe_tax_for_woocommerce.tax_registrations_lease_and_amusement_tax_use_states.includes( state )) {
					$( '.stripe_tax_for_woocommerce_tax_registration_row_lease_and_amusement' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
				}
				if (stripe_tax_for_woocommerce.tax_registrations_local_communications_tax_us_states.includes( state )) {
					$( '.stripe_tax_for_woocommerce_tax_registration_row_communications' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
				}
				if (stripe_tax_for_woocommerce.tax_registrations_no_sales_tax_us_states.includes( state )) {
					$( '.stripe_tax_for_woocommerce_tax_registration_row_no_sales_tax_us_states' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
				}
			} else if (country === 'CA') {
				$( '.stripe_tax_for_woocommerce_tax_registration_row_ca' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
			} else if (stripe_tax_for_woocommerce.tax_registrations_eu_countries.includes( country )) {
				$( '.stripe_tax_for_woocommerce_tax_registration_row_eu' ).removeClass( 'stripe_tax_for_woocommerce_hidden' );
			}
		}

		$( '#stripe_tax_for_woocommerce_id_tax_registration_country, #stripe_tax_for_woocommerce_id_tax_registration_us_state' ).change( handle_tax_registration_country_or_us_state_change );

		$( document.body ).on(
			'order-totals-recalculate-before',
			function (e, data) {
				// 'country', 'postal_code', 'city', 'line1', 'line2', 'state',
				data.stripe_tax_for_woocommerce_customer_user = $( '#customer_user' ).val();
				if ( ! data.stripe_tax_for_woocommerce_customer_user ) {
					data.stripe_tax_for_woocommerce_customer_user = 'guest';
				}
				data.stripe_tax_for_woocommerce_customer_details_shipping_address = {
					country: $( '#_shipping_country' ).val(),
					state: $( '#_shipping_state' ).val(),
					city: $( '#_shipping_city' ).val(),
					postal_code: $( '#_shipping_postcode' ).val(),
					line1: $( '#_shipping_address_1' ).val(),
					line2: $( '#_shipping_address_2' ).val(),
				};
				data.stripe_tax_for_woocommerce_customer_details_billing_address  = {
					country: $( '#_billing_country' ).val(),
					state: $( '#_billing_state' ).val(),
					city: $( '#_billing_city' ).val(),
					postal_code: $( '#_billing_postcode' ).val(),
					line1: $( '#_billing_address_1' ).val(),
					line2: $( '#_billing_address_2' ).val(),
				};
			}
		);

		var stripe_tax_for_woocommerce_inject_customer = function (event, data) {
			data = data || {};

			var customer_user = $( '#customer_user' ).val();
			if ( ! customer_user) {
				customer_user = 'guest';
			}

			data.stripe_tax_for_woocommerce_customer_user = customer_user;

			return data;
		};

		var stripe_tax_for_woocommerce_order_item_handles = [
		'add_fee',
		'add_shipping',
		'add_items',
		'add_coupon',
		'remove_coupon',
		'delete_item',
		'delete_tax',
		'save_line_items',
		'recalculate'
		];

		var $stripe_tax_for_woocommerce_order_items = $( '#woocommerce-order-items' );

		$.each(
			stripe_tax_for_woocommerce_order_item_handles,
			function (index, handle) {
				$stripe_tax_for_woocommerce_order_items.on(
					'woocommerce_order_meta_box_' + handle + '_ajax_data',
					stripe_tax_for_woocommerce_inject_customer
				);
			}
		);

		// Safety net: make sure the selected customer is attached to the order-item AJAX requests that trigger a tax calculation.
		$( document ).ajaxSend(
			function (event, jqxhr, settings) {
				if (typeof settings.data !== 'string' || settings.data === '') {
					return;
				}

				var relevant_actions = [
				'action=woocommerce_add_order_fee',
				'action=woocommerce_add_order_shipping',
				'action=woocommerce_add_order_item',
				'action=woocommerce_save_order_items',
				'action=woocommerce_add_coupon_discount',
				'action=woocommerce_remove_order_coupon',
				'action=woocommerce_remove_order_item',
				'action=woocommerce_remove_order_tax',
				'action=woocommerce_calc_line_taxes'
				];

				var is_relevant             = false;
				var relevant_actions_length = relevant_actions.length;
				for (var i = 0; i < relevant_actions_length; i++) {
					if (settings.data.indexOf( relevant_actions[i] ) !== -1) {
						is_relevant = true;
						break;
					}
				}

				if ( ! is_relevant) {
					return;
				}
				var $customer_user = $( '#customer_user' );
				if ( ! $customer_user.length) {
					return;
				}

				var customer_user = $customer_user.val();
				if ( ! customer_user) {
					customer_user = 'guest';
				}

				if (settings.data.indexOf( 'stripe_tax_for_woocommerce_customer_user=' ) === -1) {
					settings.data += '&stripe_tax_for_woocommerce_customer_user=' + encodeURIComponent( customer_user );
				}
				var line1 = $( '#_shipping_address_1' ).val() || $( '#_billing_address_1' ).val() || '';
				var line2 = $( '#_shipping_address_2' ).val() || $( '#_billing_address_2' ).val() || '';

				if (line1 && settings.data.indexOf( 'line1=' ) === -1) {
					settings.data += '&line1=' + encodeURIComponent( line1 );
				}

				if (line2 && settings.data.indexOf( 'line2=' ) === -1) {
					settings.data += '&line2=' + encodeURIComponent( line2 );
				}
			}
		);

		$( '#stripe_tax_for_woocommerce_button_id_disconnect_from_stripe' ).click(
			function (e) {
				var $this = $( this );

				e.stopPropagation();
				e.preventDefault();

				if ( ! confirm( stripe_tax_for_woocommerce.disconnect_from_stripe_message_confirmation )) {
					return;
				}

				$this.addClass( 'stripe_tax_for_woocommerce_button_disabled' )
				$.post(
					stripe_tax_for_woocommerce.ajax_url,
					{
						_nonce: $( 'input[name="stripe_tax_for_woocommerce_nonce_disconnect_from_stripe"]' ).val(),
						action: "stripe_tax_for_woocommerce_disconnect_from_stripe"
					},
					function (data) {
						if (data.success) {
							add_message( 'disconnect_from_stripe', data.data.message, 'success', $this );
							location.replace( stripe_tax_for_woocommerce.current_section_url );
						} else {
							add_message( 'disconnect_from_stripe', data.data.message, 'error', $this );
							$this.removeClass( 'stripe_tax_for_woocommerce_button_disabled' )
						}
					}
				);

			}
		);

		// Force Refresh tax registrations button handler
		$('#stripe_tax_for_woocommerce_force_refresh_btn').click(function (e) {
			var $this = $(this);
			e.stopPropagation();
			e.preventDefault();

			$this.addClass('stripe_tax_for_woocommerce_button_disabled');
			$.post(stripe_tax_for_woocommerce.ajax_url, {
				_nonce: $('#stripe_tax_for_woocommerce_nonce_force_refresh').val(),
				action: 'stripe_tax_for_woocommerce_force_refresh_tax_registrations'
			}, function (data) {
				if (data.success) {
					add_message('force_refresh', data.data.message, 'success', $this);
					location.replace(stripe_tax_for_woocommerce.current_section_url);
				} else {
					add_message('force_refresh', data.data.message, 'error', $this);
					$this.removeClass('stripe_tax_for_woocommerce_button_disabled');
				}
			});
		});

		$( document ).on(
			'click',
			'#stripe_tax_for_woocommerce_run_diagnostics',
			function (e) {
				var $this = $( this );
				e.preventDefault();
				e.stopPropagation();

				var nonce = $this.data( 'nonce' ) || stripe_tax_for_woocommerce.run_diagnostics_nonce;
				var $container = $( '#stripe_tax_for_woocommerce_diagnostics_details_container' );

				$this.addClass( 'stripe_tax_for_woocommerce_button_disabled' );
				$.post(
					stripe_tax_for_woocommerce.ajax_url,
					{
						_nonce: nonce,
						action: 'stripe_tax_for_woocommerce_run_diagnostics'
					},
					function (data) {
						if (data.success && data.data) {
							if (data.data.html) {
								$container.html( data.data.html ).show();
							} else {
								$container.empty().hide();
							}
						} else {
							add_message( 'run_diagnostics', (data.data && data.data.message ? data.data.message : stripe_tax_for_woocommerce.diagnostics_failed_message), 'error', $this.closest( '.notice' ) );
						}
					}
				).always(
					function () {
						$this.removeClass( 'stripe_tax_for_woocommerce_button_disabled' );
					}
				);
			}
		);

		function remove_message(message_id) {
			$( '.stripe_tax_for_woocommerce_message_span_id_' + message_id ).remove();
			$( '#stripe_tax_for_woocommerce_message_id_' + message_id ).remove();
		}

		function add_message(message_id, message, type, $after) {
			remove_message( message_id );

			if (message_id == 'test_connection' && type == 'success') {
				$( '.stripe_tax_for_woocommerce_message_error' ).remove();
				const save_btn = document.querySelector( '.woocommerce-save-button' );
				if ( ! save_btn.disabled) {
					add_message( 'message_wrapper', 'Remember to click “Save changes”', 'info', $( '.stripe_tax_for_woocommerce_step_1' ) );
				}
			}

			if ( ! (['info', 'error', 'success', 'warning'].includes( type ))) {
				type = 'success';
			}
			var $message = $( '<span class="stripe_tax_for_woocommerce_message_span_id_' + message_id + '"> </span><div class="stripe_tax_for_woocommerce_message"><p><strong></strong></p></div>' );
			$message
			.eq( 1 )
			.attr( 'id', 'stripe_tax_for_woocommerce_message_id_' + message_id )
			.addClass( 'stripe_tax_for_woocommerce_message_' + type )
			.find( 'strong' )
			.text( message );
			$after.after( $message );
		}

		function disable_tax_option_table_row(id, visible, defaults) {
			try {
				let optionInput = document.querySelector( "#" + id );
				let tr          = optionInput.closest( "TR" );

				if (tr) {
					if (visible === undefined) {
						tr.style.display = "none";
					} else {
						tr.classList.add( "stripe_tax_disabled" );
					}

				}
			} catch (err) {
			}
		}

		function restore_tax_option_table_row(id) {
			try {
				let optionInput = document.querySelector( "#" + id );
				let tr          = optionInput.closest( "TR" );

				if (tr) {
					tr.style.display = "";
					tr.classList.remove( "stripe_tax_disabled" );
				}
			} catch (err) {
			}
		}

		$test_connection_button.click(
			function (e) {
				var $this = $( this );
				e.preventDefault();
				e.stopPropagation();
				remove_message( 'test_connection' );
				$this.attr( 'disabled', 'disabled' );
				var mode      = $this.data( 'mode' );
				var $sk_field = $( 'tr.js-stripe_tax_for_woocommerce_' + mode + '_mode .js_stripe_tax_for_woocommerce_sec_key' );
				$.post(
					stripe_tax_for_woocommerce.ajax_url,
					{
						_nonce: $( 'input[name="stripe_tax_for_woocommerce_nonce_test_connection_' + mode + '_key"]' ).val(),
						action: "stripe_tax_for_woocommerce_test_connection",
						key: ($sk_field.val() || ''),
						mode: ( mode == 'test' ? 1 : 0 ),
					},
					function (data) {
						if (data.success) {
							add_message( 'test_connection', data.data.message, 'success', $this );
						} else {
							add_message( 'test_connection', data.data.message, 'error', $this );
						}
					}
				).always(
					function () {
						$this.removeAttr( 'disabled' );
					}
				);
			}
		);

		var select2_args = $.extend(
			{
				allowClear: false,
			},
			[]
		);

		var $tax_code = $( '#_stripe_tax_for_woocommerce_tax_code' );

		if ($tax_code.length > 0) {
			$( $tax_code ).selectWoo( select2_args );
		}

		var $button_add_tax_id = $( '.stripe_tax_for_woocommerce_button_add_tax_id' );

		$button_add_tax_id.click(
			function (e) {
				e.stopPropagation();
				e.preventDefault();

				var new_tax_id_row = $( stripe_tax_for_woocommerce.tax_ids_html );
				$( '.stripe_tax_for_woocommerce_tax_id_item' ).last().after( new_tax_id_row );
				var closest_container = new_tax_id_row.closest( '.stripe_tax_for_woocommerce_tax_ids' );
				var counter           = parseInt( closest_container.data( 'tax_ids_count' ) );
				new_tax_id_row.find( 'select' ).attr( 'name', 'stripe_tax_for_woocommerce_tax_id[' + counter + ']' );
				new_tax_id_row.find( 'input[type="text"]' ).attr( 'name', 'stripe_tax_for_woocommerce_tax_id_value[' + counter + ']' );
				closest_container.data( 'tax_ids_count', counter + 1 );

				new_tax_id_row.find( 'select' ).selectWoo(
					{
						allowClear: false, width: "400px",
					}
				);

				if ($( '.stripe_tax_for_woocommerce_tax_id_item' ).length > 5) {
					$( this ).attr( 'disabled', 'disabled' );
				}
			}
		);

		$( '.stripe_tax_for_woocommerce_tax_ids' ).on(
			'click',
			'.stripe_tax_for_woocommerce_button_remove_tax_id',
			function (e) {
				$button_add_tax_id.removeAttr( 'disabled' );
				$( this ).closest( '.stripe_tax_for_woocommerce_tax_id_item' ).remove();
			}
		);

		$( 'input, textarea, select, checkbox' ).on(
			'change input',
			function (event) {
				$( '.woocommerce-save-button' ).removeAttr( 'disabled' );
				$( '#stripe_tax_for_woocommerce_unsaved_changes_notice' ).show();
			}
		);

		// Keep the Save button enabled by default.
		if ($( '.stripe_tax_for_woocommerce_tax_registrations' ).length) {
			$( '.woocommerce-save-button' ).removeAttr( 'disabled' );
		}

		$( '.woocommerce-save-button' ).closest( 'form' ).on(
			'submit',
			function (event) {
				$( '.woocommerce-save-button' ).css( 'pointer-events', 'none' );
			}
		);

		var stripe_tax_for_woocommerce_live_mode_enabled = ( typeof stripe_tax_for_woocommerce !== 'undefined' ) && !! stripe_tax_for_woocommerce.live_mode_enabled;
		var stripe_tax_for_woocommerce_tax_rows          = [
			[ "woocommerce_tax_round_at_subtotal", undefined ],
			[ "woocommerce_tax_classes", undefined ],
			[ "woocommerce_tax_based_on", true ],
			[ "woocommerce_shipping_tax_class", undefined ]
		];

		$.each(
			stripe_tax_for_woocommerce_tax_rows,
			function (index, row) {
				if (stripe_tax_for_woocommerce_live_mode_enabled) {
					disable_tax_option_table_row( row[0], row[1] );
				} else {
					restore_tax_option_table_row( row[0] );
				}
			}
		);
	}
);

(function ($) {
	'use strict';

	const stripe_settings = {
		stripeApp: null,
		init() {

			$( '#stripe_tax_for_woocommerce_message_id_stripe_tax_api_keys_message a' ).on(
				'click',
				function (e) {
					e.preventDefault();

					const url = $( this ).attr( 'href' );
					if ( ! url) {
						return;
					}

					// Reuse the same tab/window.
					if (stripe_settings.stripeApp && ! stripe_settings.stripeApp.closed) {
						stripe_settings.stripeApp.location.href = url;
						stripe_settings.stripeApp.focus();
					} else {
						// Give it a stable name so the browser reuses it.
						stripe_settings.stripeApp = window.open( url, 'stripeTaxAppWindow' );
					}
				}
			);
			// Change mode live/test.
			var $modeToggle = $( '#stripe_tax_for_woocommerce_id_toggle_mode' );
			$modeToggle.attr( 'data-initial-checked', $modeToggle.is( ':checked' ) ? '1' : '0' );
			stripe_settings.applyModeState( $modeToggle );
			$( document ).on(
				'change',
				'#stripe_tax_for_woocommerce_id_toggle_mode',
				function (e) {
					e.preventDefault();
					stripe_settings.toggleMode( $( this ) );
				}
			);

			$( document ).on(
				'keyup',
				'.js_stripe_tax_for_woocommerce_live_mode',
				function (e) {
					stripe_settings.setTestConnectionBtnStatus( 'live' );
				}
			);

			$( document ).on(
				'keyup',
				'.js_stripe_tax_for_woocommerce_test_mode',
				function (e) {
					stripe_settings.setTestConnectionBtnStatus( 'test' );
				}
			);

		},
		toggleMode( toggleCheckboxObj ) {
			var $diagnosticsDetailsContainer = $( '#stripe_tax_for_woocommerce_diagnostics_details_container' );

			$diagnosticsDetailsContainer.hide();
			stripe_settings.applyModeState( toggleCheckboxObj );
		},
		applyModeState( toggleCheckboxObj ) {
			var $modeTip          = $( '.js-mode-tip' );
			var $modeCurrentLabel = $( '.js-mode-current-label' );
			var $apiKeysMessage = $( '#stripe_tax_for_woocommerce_message_id_stripe_tax_api_keys_message' );
			var liveLabel         = toggleCheckboxObj.attr( 'data-label-live' );
			var sandboxLabel      = toggleCheckboxObj.attr( 'data-label-sandbox' );
			var unsavedLiveLabel  = toggleCheckboxObj.attr( 'data-label-unsaved-live' );
			var unsavedSandboxLabel = toggleCheckboxObj.attr( 'data-label-unsaved-sandbox' );
			var initialChecked    = toggleCheckboxObj.attr( 'data-initial-checked' );
			var hasUnsavedModeChange;
			var selectedLabel;

			if ( typeof initialChecked === 'undefined' ) {
				initialChecked = toggleCheckboxObj.is( ':checked' ) ? '1' : '0';
				toggleCheckboxObj.attr( 'data-initial-checked', initialChecked );
			}

			hasUnsavedModeChange = toggleCheckboxObj.is( ':checked' ) !== ( initialChecked === '1' );
			if (toggleCheckboxObj.is( ':checked' )) {
				$( '.js-live-text' ).hide();
				$( '.js-sandbox-text' ).show();
				$( '.js-stripe_tax_for_woocommerce_test_mode' ).show();
				$( '.js-stripe_tax_for_woocommerce_live_mode' ).hide();
				$modeTip.attr( 'data-tip', $modeTip.attr( 'data-tip-sandbox' ) );
				selectedLabel = hasUnsavedModeChange ? unsavedSandboxLabel : sandboxLabel;
			} else {
				$( '.js-live-text' ).show();
				$( '.js-sandbox-text' ).hide();
				$( '.js-stripe_tax_for_woocommerce_test_mode' ).hide();
				$( '.js-stripe_tax_for_woocommerce_live_mode' ).show();
				$modeTip.attr( 'data-tip', $modeTip.attr( 'data-tip-live' ) );
				selectedLabel = hasUnsavedModeChange ? unsavedLiveLabel : liveLabel;
			}
			$apiKeysMessage.show();
			$modeCurrentLabel.text( selectedLabel );
			toggleCheckboxObj.attr( 'aria-label', selectedLabel );
			$modeTip.tipTip( { attribute: 'data-tip', fadeIn: 50, fadeOut: 50, delay: 200 } );
		},
		setTestConnectionBtnStatus( mode ) {
			const $fields = $( '.js_stripe_tax_for_woocommerce_' + mode + '_mode' );
			const $btn    = $( '#stripe_tax_for_woocommerce_id_btn_test_connection_' + mode + '_key' );

			// True if every field has a non-empty (trimmed) value.
			const allFilled = $fields.toArray().every( el => $.trim( $( el ).val() ) !== '' );

			// Enable when all are filled, disable otherwise.
			$btn.prop( 'disabled', ! allFilled );

		}
	};

	$(
		function () {
			if ($( '.stripe_tax_for_woocommerce_settings' ).length) {
					stripe_settings.init();
			}
		}
	);

})( jQuery );
