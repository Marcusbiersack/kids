// models/BrCode.ts

import { stripHtml } from "string-strip-html";
import pkg from 'steplix-emv-qrcps';

const { Merchant } = pkg;

export default class BrCode {
  key: string;
  amount: string;
  name: string;
  reference: string;
  key_type: string;
  city: string;

  constructor(key: string, amount: string, name: string, reference: string, key_type: string, city: string) {
    this.key = this.normalize(key);
    this.amount = this.normalize(amount);
    this.name = this.normalize(name);
    this.reference = this.normalize(reference);
    this.key_type = this.normalize(key_type);
    this.city = this.normalize(city);
  }

  // Método estático para formatar o texto removendo acentuação e normalizando
  static format_text(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  // Normalizar o texto e remover tags HTML
  normalize(text: string): string {
    if (text != null) {
      return stripHtml(text).result;
    }
    return "";
  }

  // Formatação do nome do merchant
  formated_name(): string {
    return BrCode.format_text(this.name); // Acesso correto ao método estático
  }

  // Formatação da cidade do merchant
  formated_city(): string {
    return BrCode.format_text(this.city); // Acesso correto ao método estático
  }

  // Formatação do valor
  formated_amount(): string {
    if (this.amount) {
      return this.amount.replace('.', '').replace(',', '.').replace(' ', '').replace("R$", '');
    }
    return '';
  }

  // Formatação da referência
  formated_referance(): string {
    return BrCode.format_text(this.reference).replace(' ', ''); // Acesso correto ao método estático
  }

  // Formatação da chave do PIX
  formated_key(): string {
    let rkey = this.key;
    let ktype = this.key_type.toLowerCase();

    if (ktype == 'telefone' || ktype == 'cnpj' || ktype == "cpf") {
      rkey = rkey.replace(/\D/g, ''); // Remove caracteres não numéricos
    }

    if (ktype == "telefone") {
      rkey = "+55" + rkey; // Adiciona o DDI para telefones
    }

    return rkey.trim();
  }

  // Geração do QR Code PIX
  generate_qrcp(): string {
    var emvqr = Merchant.buildEMVQR();

    emvqr.setPayloadFormatIndicator("01");
    emvqr.setCountryCode("BR");
    emvqr.setMerchantCategoryCode("0000");
    emvqr.setTransactionCurrency("986");

    const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
    merchantAccountInformation.setGloballyUniqueIdentifier("BR.GOV.BCB.PIX");

    merchantAccountInformation.addPaymentNetworkSpecific("01", this.formated_key());

    emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

    if (this.name) {
      emvqr.setMerchantName(this.formated_name());
    }

    if (this.city) {
      emvqr.setMerchantCity(this.formated_city());
    }

    if (this.amount && this.amount != '') {
      emvqr.setTransactionAmount(this.formated_amount());
    }

    const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

    if (this.reference) {
      additionalDataFieldTemplate.setReferenceLabel(this.formated_referance());
    } else {
      additionalDataFieldTemplate.setReferenceLabel("***");
    }

    emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);

    return emvqr.generatePayload();
  }
}